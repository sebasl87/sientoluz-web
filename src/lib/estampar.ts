import { PDFDocument, setCharacterSpacing, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { MARCA } from "./marca";
import { fuente, FUENTES } from "./fuentes";

/**
 * Personaliza un MAESTRO LIMPIO con los datos del comprador. Solo dibuja:
 *
 *   · pie, en cada página menos la portada:
 *       "Ejemplar de {nombre} · {email}"        6.5pt · #BFB6D6 · centrado
 *   · colofón, en la última página:
 *       "© SientoLuz {año}. Ejemplar entregado a {nombre} · orden {orden}
 *        · no está permitida su redistribución."
 *       7.5pt · gris #8C85A0, con el nombre en NEGRITA NOCHE — es la línea
 *       antipiratería: el nombre tiene que saltar a la vista.
 *
 * Los maestros limpios se generan una única vez con limpiar-maestros.mts,
 * que les quita las líneas con tokens. Este módulo NO sabe de tokens, no
 * decodifica CMaps ni toca content streams: parte de una zona vacía y
 * escribe. Todo lo frágil quedó en la herramienta offline.
 *
 * Geometría (medida de los originales, verificada en las 180 páginas):
 *   pie:      baseline y = 23.4 · centrado en anchoPágina/2
 *   colofón:  misma baseline que traía (≈56 desde abajo en Meditación,
 *             pero varía por curso) → lo ubicamos relativo al margen:
 *             y = 34 (debajo del disclaimer, arriba del borde), centrado.
 */

const PIE = { y: 23.4, size: 6.5, spacing: 0.3 } as const;
const COLOFON = { y: 34, size: 7.5, spacing: 0.2 } as const;
const GRIS_LEGAL = rgb(0x8c / 255, 0x85 / 255, 0xa0 / 255); // .legal del CSS

// El pie convive con vecinos: "SientoLuz · <curso>" termina en x≈140 y el
// número de página arranca en x≈533. Centrado, el máximo seguro es ~290.
const PIE_ANCHO_MAX = 290;
// El colofón tiene los márgenes de página completos.
const MARGEN = 56.7;



function ancho(t: string, f: PDFFont, size: number, spacing: number): number {
  return f.widthOfTextAtSize(t, size) + Math.max(0, t.length - 1) * spacing;
}

/** Achica hasta que entre; si ni al 75% entra, recorta con elipsis. */
function ajustar(
  texto: string,
  f: PDFFont,
  size: number,
  spacing: number,
  max: number
): { texto: string; size: number } {
  const min = size * 0.75;
  for (let s = size; s >= min; s -= 0.25) {
    if (ancho(texto, f, s, spacing) <= max) return { texto, size: s };
  }
  let corto = texto;
  while (corto.length > 12 && ancho(corto + "…", f, min, spacing) > max) corto = corto.slice(0, -1);
  return { texto: corto + "…", size: min };
}

function dibujarCentrado(
  pagina: PDFPage,
  texto: string,
  y: number,
  size: number,
  spacing: number,
  fuente: PDFFont,
  color = MARCA.marcaAgua
) {
  const w = ancho(texto, fuente, size, spacing);
  pagina.pushOperators(setCharacterSpacing(spacing));
  pagina.drawText(texto, { x: pagina.getWidth() / 2 - w / 2, y, size, font: fuente, color });
  pagina.pushOperators(setCharacterSpacing(0));
}

export type DatosComprador = { nombre: string; email: string; orden: string };

export async function estamparCurso(
  maestroLimpio: Uint8Array | ArrayBuffer,
  c: DatosComprador
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(maestroLimpio);
  doc.registerFontkit(fontkit);
  const [regular, bold] = await Promise.all([fuente(FUENTES.nunito), fuente(FUENTES.nunitoBold)]);
  const nunito = await doc.embedFont(regular, { subset: true });
  const nunitoBold = await doc.embedFont(bold, { subset: true });

  const nombre = c.nombre.trim();
  const email = c.email.trim();
  const orden = c.orden.trim();

  // ── Pie en cada página menos la portada ──
  const pie = ajustar(
    `Ejemplar de ${nombre} · ${email}`,
    nunito,
    PIE.size,
    PIE.spacing,
    PIE_ANCHO_MAX
  );
  const paginas = doc.getPages();
  for (const pagina of paginas.slice(1)) {
    dibujarCentrado(pagina, pie.texto, PIE.y, pie.size, PIE.spacing, nunito);
  }

  // ── Colofón en la última página: tres runs, el nombre resaltado ──
  const ultima = paginas.at(-1)!;
  const anio = new Date().getFullYear();
  const antes = `© SientoLuz ${anio}. Ejemplar entregado a `;
  const despues = ` · orden ${orden} · no está permitida su redistribución.`;

  const disponible = ultima.getWidth() - 2 * MARGEN;
  // El nombre es lo único variable: si la línea no entra, se achica entera.
  let size = COLOFON.size;
  const total = () =>
    ancho(antes, nunito, size, COLOFON.spacing) +
    ancho(nombre, nunitoBold, size, COLOFON.spacing) +
    ancho(despues, nunito, size, COLOFON.spacing);
  while (size > COLOFON.size * 0.75 && total() > disponible) size -= 0.25;

  let x = ultima.getWidth() / 2 - total() / 2;
  const runs: [string, PDFFont, ReturnType<typeof rgb>][] = [
    [antes, nunito, GRIS_LEGAL],
    [nombre, nunitoBold, MARCA.noche],
    [despues, nunito, GRIS_LEGAL],
  ];
  ultima.pushOperators(setCharacterSpacing(COLOFON.spacing));
  for (const [texto, fuente, color] of runs) {
    ultima.drawText(texto, { x, y: COLOFON.y, size, font: fuente, color });
    x += ancho(texto, fuente, size, COLOFON.spacing);
  }
  ultima.pushOperators(setCharacterSpacing(0));

  doc.setProducer("SientoLuz");
  doc.setCreator("SientoLuz");
  return doc.save();
}
