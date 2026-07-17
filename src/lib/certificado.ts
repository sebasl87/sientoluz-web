import { PDFDocument, setCharacterSpacing, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { MARCA } from "./marca";
import { fuente, FUENTES } from "./fuentes";

/**
 * Certificado de participación · A4 apaisado, generado desde cero.
 *
 * Composición, de arriba hacia abajo:
 *   · marco doble fino en amatista
 *   · la espiral de la marca (el mismo path SVG de Espiral.tsx)
 *   · CERTIFICADO DE PARTICIPACIÓN     Josefin Light, espaciada
 *   · "SientoLuz certifica que"
 *   · el nombre                        Cormorant Italic, grande
 *   · regla lavanda
 *   · "completó el taller"
 *   · EL NOMBRE DEL TALLER             Josefin, amatista
 *   · fecha
 *   · pie: sientoluz.com · @sientoluz · orden
 */

const APAISADO = { ancho: 841.89, alto: 595.28 } as const;
const GRIS = rgb(0x8c / 255, 0x85 / 255, 0xa0 / 255);

// ── La espiral tal cual vive en Espiral.tsx (viewBox 200×200) ──
const ESPIRAL_CIRCULO = "M173.3 73.32 A78 78 0 1 1 139 32.45";
const ESPIRAL_PATH =
  "M100.0 100.0L100.1 99.5L100.2 99.1L100.5 98.6L100.8 98.3L101.2 98.0L101.7 97.7L102.3 97.6L102.9 97.5L103.6 97.6L104.2 97.8L104.9 98.1L105.5 98.5L106.1 99.0L106.7 99.7L107.1 100.4L107.5 101.3L107.8 102.2L108.0 103.2L108.0 104.3L107.8 105.4L107.6 106.6L107.1 107.7L106.6 108.8L105.8 109.9L104.9 110.9L103.8 111.8L102.6 112.6L101.3 113.3L99.8 113.8L98.3 114.2L96.6 114.4L94.9 114.4L93.2 114.2L91.4 113.8L89.7 113.1L88.0 112.3L86.4 111.2L84.8 109.9L83.4 108.4L82.2 106.8L81.1 104.9L80.2 102.9L79.5 100.7L79.1 98.5L78.9 96.1L79.0 93.7L79.3 91.3L80.0 88.9L80.9 86.5L82.2 84.2L83.7 82.0L85.4 79.9L87.4 78.1L89.7 76.4L92.2 75.0L94.9 73.8L97.7 72.9L100.7 72.3L103.7 72.1L106.8 72.2L110.0 72.7L113.1 73.5L116.2 74.7L119.1 76.2L121.9 78.1L124.5 80.3L126.9 82.8L129.1 85.6L130.9 88.7L132.4 92.0L133.6 95.5L134.3 99.2L134.7 102.9L134.6 106.8L134.1 110.6L133.2 114.5L131.9 118.2L130.1 121.9L127.9 125.3L125.3 128.6L122.3 131.5L119.0 134.2L115.4 136.5L111.5 138.4L107.3 139.9L103.0 140.9L98.5 141.5L93.9 141.5L89.3 141.1L84.8 140.1L80.3 138.7L76.0 136.7L71.8 134.2L67.9 131.3L64.3 127.9L61.1 124.2L58.3 120.0L55.9 115.5L54.0 110.7L52.7 105.7L51.8 100.6L51.6 95.3L51.9 90.0L52.8 84.7L54.3 79.4L56.4 74.4L59.1 69.5L62.3 64.9L66.0 60.7L70.2 56.8L74.8 53.4L79.9 50.5L85.2 48.2L90.8 46.4L96.7 45.3L102.7 44.7L108.7 44.9L114.8 45.7L120.8 47.2L126.6 49.3L132.2 52.1L137.5 55.5L142.5 59.5L147.0 64.1L151.0 69.2L154.5 74.7L157.4 80.6L159.6 86.8L161.2 93.3L162.0 100.0";


function centrado(
  pagina: PDFPage,
  texto: string,
  y: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
  spacing = 0
) {
  const w = font.widthOfTextAtSize(texto, size) + Math.max(0, texto.length - 1) * spacing;
  if (spacing) pagina.pushOperators(setCharacterSpacing(spacing));
  pagina.drawText(texto, { x: APAISADO.ancho / 2 - w / 2, y, size, font, color });
  if (spacing) pagina.pushOperators(setCharacterSpacing(0));
}

/** Achica hasta que el texto entre en `max` puntos de ancho. */
function tamanoQueEntra(texto: string, font: PDFFont, size: number, max: number): number {
  let s = size;
  while (s > size * 0.5 && font.widthOfTextAtSize(texto, s) > max) s -= 0.5;
  return s;
}

export type DatosCertificado = {
  nombre: string;
  curso: string; // nombre del taller
  orden: string;
  fecha?: Date;
};

export async function generarCertificado(d: DatosCertificado): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [bJosefin, bNunito, bCormorant] = await Promise.all([
    fuente(FUENTES.josefin),
    fuente(FUENTES.nunito),
    fuente(FUENTES.cormorant),
  ]);
  const josefin = await doc.embedFont(bJosefin, { subset: true });
  const nunito = await doc.embedFont(bNunito, { subset: true });
  const cormorant = await doc.embedFont(bCormorant, { subset: true });

  const p = doc.addPage([APAISADO.ancho, APAISADO.alto]);
  const { ancho, alto } = APAISADO;

  // ── Fondo crema ──
  p.drawRectangle({ x: 0, y: 0, width: ancho, height: alto, color: MARCA.crema });

  // ── Marco doble: fino afuera, más fino adentro ──
  p.drawRectangle({
    x: 28, y: 28, width: ancho - 56, height: alto - 56,
    borderColor: MARCA.amatista, borderWidth: 1.2,
  });
  p.drawRectangle({
    x: 34, y: 34, width: ancho - 68, height: alto - 68,
    borderColor: MARCA.lavanda, borderWidth: 0.6,
  });

  // ── La espiral, arriba al centro ──
  // drawSvgPath dibuja en coordenadas SVG (y hacia abajo) desde (x, y).
  // viewBox original 200×200 → escala 0.42 = 84pt de lado.
  const LADO = 84;
  const escala = LADO / 200;
  const ejeX = ancho / 2 - LADO / 2;
  const ejeY = alto - 52; // borde superior del símbolo
  const trazo = { borderColor: MARCA.amatista, borderWidth: 1.5 / escala, scale: escala };
  p.drawSvgPath(ESPIRAL_CIRCULO, { x: ejeX, y: ejeY, ...trazo });
  p.drawSvgPath(ESPIRAL_PATH, { x: ejeX, y: ejeY, ...trazo });
  // corazón lila y punto jade (coordenadas del viewBox, escaladas a mano)
  p.drawCircle({ x: ejeX + 100 * escala, y: ejeY - 100 * escala, size: 4 * escala, color: MARCA.lila });
  p.drawCircle({ x: ejeX + 159.75 * escala, y: ejeY - 49.86 * escala, size: 5 * escala, color: MARCA.jade });

  // ── Textos ──
  centrado(p, "CERTIFICADO DE PARTICIPACIÓN", alto - 178, 15, josefin, MARCA.noche, 4);
  centrado(p, "SientoLuz certifica que", alto - 218, 10.5, nunito, GRIS);

  const nombre = d.nombre.trim();
  const sizeNombre = tamanoQueEntra(nombre, cormorant, 40, ancho - 220);
  centrado(p, nombre, alto - 272, sizeNombre, cormorant, MARCA.noche);

  // regla lavanda bajo el nombre
  p.drawLine({
    start: { x: ancho / 2 - 130, y: alto - 288 },
    end: { x: ancho / 2 + 130, y: alto - 288 },
    color: MARCA.lavanda,
    thickness: 0.8,
  });

  centrado(p, "completó el taller", alto - 318, 10.5, nunito, GRIS);

  const curso = d.curso.trim().toUpperCase();
  const sizeCurso = tamanoQueEntra(curso, josefin, 19, ancho - 200);
  centrado(p, curso, alto - 352, sizeCurso, josefin, MARCA.amatista, 2.5);

  const fecha = (d.fecha ?? new Date()).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  centrado(p, `Buenos Aires, ${fecha}`, alto - 392, 9, nunito, GRIS);

  // ── Pie ──
  centrado(p, "SIENTOLUZ.COM  ·  @SIENTOLUZ", 64, 8, josefin, MARCA.amatista, 2);
  centrado(p, `Certificado emitido con la orden ${d.orden.trim()}`, 48, 6.5, nunito, MARCA.marcaAgua);

  doc.setTitle(`Certificado · ${d.curso}`);
  doc.setProducer("SientoLuz");
  doc.setCreator("SientoLuz");
  return doc.save();
}
