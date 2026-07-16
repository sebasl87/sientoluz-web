import { notFound } from "next/navigation";
import { precio } from "@/lib/formato";
import { supabaseServidor } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Datos para transferir" };

export default async function Transferencia({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;

  const { data: orden } = await supabaseServidor()
    .from("ordenes")
    .select("numero, total_ars, estado, orden_items ( nombre )")
    .eq("numero", numero)
    .maybeSingle();

  if (!orden) notFound();

  const items = (orden.orden_items ?? []) as { nombre: string }[];
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;
  const mensaje = encodeURIComponent(
    `Hola! Te paso el comprobante de la orden ${orden.numero} (${precio(orden.total_ars)}).`
  );

  const dato = "font-titulo text-[0.65rem] tracking-[0.2em] uppercase text-noche/55";

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Orden {orden.numero}</p>
      <h1 className="mt-3 text-3xl">Datos para transferir</h1>
      <p className="mt-5 leading-relaxed text-noche/75">
        Transferí {precio(orden.total_ars)} a esta cuenta y mandanos el comprobante por
        WhatsApp. Lo confirmamos el mismo día y te llega el material al mail.
      </p>

      <dl className="mt-10 divide-y divide-lavanda rounded-sm border border-lavanda bg-white/40">
        {[
          ["Titular", process.env.NEXT_PUBLIC_TRANSF_TITULAR],
          ["Alias", process.env.NEXT_PUBLIC_TRANSF_ALIAS],
          ["CBU", process.env.NEXT_PUBLIC_TRANSF_CBU],
          ["Importe", precio(orden.total_ars)],
          ["Concepto", orden.numero],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 px-5 py-4">
            <dt className={dato}>{k}</dt>
            <dd className="text-right text-sm font-semibold break-all">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-noche/60">
        Poné el número de orden en el concepto: es lo que nos deja identificar tu pago
        sin preguntarte nada.
      </p>

      <div className="mt-8">
        <p className={dato}>Tu compra</p>
        <ul className="mt-2 space-y-1 text-sm text-noche/80">
          {items.map((i) => (
            <li key={i.nombre}>· {i.nombre}</li>
          ))}
        </ul>
      </div>

      {wa && (
        <a
          href={`https://wa.me/${wa}?text=${mensaje}`}
          className="mt-10 block rounded-sm bg-jade px-6 py-3.5 text-center font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover"
        >
          Mandar el comprobante por WhatsApp
        </a>
      )}

      <p className="mt-6 text-center text-xs text-noche/50">
        Guardá este link: podés volver cuando quieras.
      </p>
    </div>
  );
}
