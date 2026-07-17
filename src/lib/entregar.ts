import { supabaseServidor } from "./supabase";
import { estamparCurso } from "./estampar";
import { generarCertificado } from "./certificado";
import { emailEntrega } from "./emails";
import { Resend } from "resend";

/**
 * entregar(ordenId) — el corazón del negocio.
 *
 * Toma una orden en estado 'pagado' y:
 *   1. resuelve los cursos (los kits se expanden a sus cursos)
 *   2. por cada curso: baja el maestro limpio del bucket 'cursos',
 *      lo estampa con nombre/email/orden, lo sube a 'entregas/'
 *   3. genera un certificado por curso y lo sube
 *   4. firma links de descarga con vencimiento
 *   5. manda el mail por Resend
 *   6. registra las filas en `entregas` y marca la orden 'entregado'
 *
 * La llaman dos disparadores:
 *   · el webhook de Mercado Pago, cuando el pago queda approved
 *   · el botón Aprobar del /admin, para transferencias
 *
 * ── Idempotencia y fallas ──
 * Si algo falla, tira: la orden queda en 'pagado' y el admin muestra
 * Reintentar. Reintentar es seguro: los uploads usan upsert, así que
 * pisan lo que hubiera quedado a medias. Si la orden ya está
 * 'entregado', vuelve sin hacer nada (el webhook de MP puede llegar
 * repetido: manda la misma notificación varias veces por diseño).
 *
 * ── El link firmado ──
 * VIGENCIA_DIAS = 30. La página de gracias y el mail lo dicen. Los
 * PDFs quedan en el bucket por si hay que re-firmar (soporte manual
 * desde el admin más adelante).
 */

const VIGENCIA_DIAS = 30;
const VIGENCIA_SEG = VIGENCIA_DIAS * 24 * 3600;

type CursoAEntregar = {
  id: string;
  slug: string;
  nombre: string;
  archivo: string; // ruta del maestro limpio en el bucket 'cursos'
};

export type ResultadoEntrega = {
  yaEstaba: boolean;
  numero: string;
  email: string;
  archivos: { nombre: string; url: string }[];
};

export async function entregar(ordenId: string): Promise<ResultadoEntrega> {
  const db = supabaseServidor();

  // ── 1 · La orden, el cliente y los items ──
  const { data: orden, error: e1 } = await db
    .from("ordenes")
    .select(
      `id, numero, estado, metodo,
       clientes ( nombre, email ),
       orden_items ( curso_id, kit_id, nombre )`
    )
    .eq("id", ordenId)
    .single();
  if (e1 || !orden) throw new Error(`Orden ${ordenId} no encontrada: ${e1?.message}`);

  const cliente = orden.clientes as unknown as { nombre: string; email: string };
  if (!cliente?.email) throw new Error(`Orden ${orden.numero} sin cliente`);

  if (orden.estado === "entregado") {
    return { yaEstaba: true, numero: orden.numero, email: cliente.email, archivos: [] };
  }
  if (orden.estado !== "pagado") {
    throw new Error(`Orden ${orden.numero} está '${orden.estado}', no se entrega`);
  }

  // ── 2 · Expandir items a cursos ──
  const items = (orden.orden_items ?? []) as { curso_id: string | null; kit_id: string | null }[];
  const cursoIds = new Set(items.filter((i) => i.curso_id).map((i) => i.curso_id!));
  const kitIds = items.filter((i) => i.kit_id).map((i) => i.kit_id!);

  if (kitIds.length) {
    const { data: kc, error } = await db
      .from("kit_cursos")
      .select("curso_id")
      .in("kit_id", kitIds);
    if (error) throw new Error(`Expandiendo kits: ${error.message}`);
    for (const fila of kc ?? []) cursoIds.add(fila.curso_id);
  }
  if (!cursoIds.size) throw new Error(`Orden ${orden.numero} sin cursos`);

  const { data: cursos, error: e2 } = await db
    .from("cursos")
    .select("id, slug, nombre, archivo")
    .in("id", [...cursoIds]);
  if (e2 || !cursos?.length) throw new Error(`Cargando cursos: ${e2?.message}`);

  // ── 3 · Estampar, certificar y subir ──
  // En paralelo, a propósito. Secuencial, un Kit de 6 cursos son ~37 viajes
  // de red a Supabase encadenados; a 100 ms cada uno son casi 4 segundos
  // solo esperando. En paralelo, los viajes se superponen y lo único que
  // queda en serie es la CPU del estampado. Importa porque hay hosts con
  // timeout de 10 s en las funciones.
  const comprador = {
    nombre: cliente.nombre,
    email: cliente.email,
    orden: orden.numero,
  };
  const carpeta = orden.numero; // entregas/SL-26-1001/…

  const subidos = await Promise.all(
    (cursos as CursoAEntregar[]).map(async (curso) => {
      const bajada = await db.storage.from("cursos").download(curso.archivo);
      if (bajada.error || !bajada.data) {
        throw new Error(`Bajando maestro '${curso.archivo}': ${bajada.error?.message}`);
      }

      const [estampado, certificado] = await Promise.all([
        estamparCurso(await bajada.data.arrayBuffer(), comprador),
        generarCertificado({
          nombre: cliente.nombre,
          curso: curso.nombre,
          orden: orden.numero,
        }),
      ]);

      const rutaPdf = `${carpeta}/${curso.archivo.split("/").pop()}`;
      const rutaCert = `${carpeta}/certificado-${curso.slug}.pdf`;

      await Promise.all(
        ([
          [rutaPdf, estampado],
          [rutaCert, certificado],
        ] as const).map(async ([ruta, bytes]) => {
          const subida = await db.storage
            .from("entregas")
            .upload(ruta, bytes as Uint8Array<ArrayBuffer>, {
              contentType: "application/pdf",
              upsert: true, // reintentar pisa lo que haya quedado a medias
            });
          if (subida.error) throw new Error(`Subiendo '${ruta}': ${subida.error.message}`);
        })
      );

      return { curso, rutaPdf, rutaCert };
    })
  );

  // ── 4 · Links firmados ──
  const porCurso = await Promise.all(
    subidos.map(async (s) =>
      Promise.all(
        ([
          [s.curso.nombre, s.rutaPdf],
          [`Certificado · ${s.curso.nombre}`, s.rutaCert],
        ] as const).map(async ([nombre, ruta]) => {
          const firma = await db.storage.from("entregas").createSignedUrl(ruta, VIGENCIA_SEG);
          if (firma.error || !firma.data) {
            throw new Error(`Firmando '${ruta}': ${firma.error?.message}`);
          }
          return { nombre, url: firma.data.signedUrl };
        })
      )
    )
  );
  const archivos = porCurso.flat();

  // ── 5 · El mail ──
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: eMail } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "SientoLuz <hola@sientoluz.com>",
    to: cliente.email,
    subject: `Tu compra está lista ✧ orden ${orden.numero}`,
    html: emailEntrega({
      nombre: cliente.nombre,
      numero: orden.numero,
      archivos,
      vigenciaDias: VIGENCIA_DIAS,
    }),
  });
  if (eMail) throw new Error(`Enviando el mail: ${eMail.message}`);

  // ── 6 · Registrar ──
  // El mail ya salió: de acá en adelante no tiramos aunque algo falle,
  // porque un reintento mandaría el mail dos veces. Solo dejamos log.
  const { error: e3 } = await db.from("entregas").insert(
    subidos.map((s) => ({
      orden_id: orden.id,
      curso_id: s.curso.id,
      archivo: s.rutaPdf,
    }))
  );
  if (e3) console.error(`[entregar] orden ${orden.numero}: mail enviado pero falló el insert en entregas: ${e3.message}`);

  const { error: e4 } = await db
    .from("ordenes")
    .update({ estado: "entregado", entregado_en: new Date().toISOString() })
    .eq("id", orden.id);
  if (e4) console.error(`[entregar] orden ${orden.numero}: mail enviado pero falló el update de estado: ${e4.message}`);

  return { yaEstaba: false, numero: orden.numero, email: cliente.email, archivos };
}
