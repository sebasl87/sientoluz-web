/**
 * Herramienta OFFLINE, se corre una sola vez.
 * Quita de los PDFs maestros todo texto con tokens:
 *   · el pie  "Ejemplar de {{NOMBRE_COMPRADOR}} · {{EMAIL}}"  (cada página)
 *   · el colofón completo "© SientoLuz 2026. Ejemplar entregado a
 *     {{NOMBRE_COMPRADOR}} · orden {{ORDEN}} · …"  (última página)
 *
 * Lección aprendida a los golpes: la unidad NO es el bloque BT…ET.
 * WeasyPrint mete varias líneas en un bloque (cada una arranca con su Tm),
 * y una línea puede estar partida en varios bloques (runs con distinto
 * estilo). La unidad correcta es el SEGMENTO: lo que va de un Tm al
 * siguiente. Se decodifica cada segmento, se junta por renglón (mismo y),
 * y se borran los segmentos de los renglones que contienen "{{".
 */
import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRawStream, decodePDFRawStream } from "pdf-lib";

const ESCALA = 0.75;
const BLOQUE = /BT[\s\S]*?ET/g;
const TM_G = /([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+Tm/g;
const TF = /\/(\w+)\s+([\d.]+)\s+Tf/;
const HEX = /<([0-9a-fA-F]+)>/g;

function parsearCMap(cmap: string) {
  const m = new Map<string, string>();
  const uni = (h: string) => String.fromCodePoint(...(h.match(/.{4}/g) ?? []).map((x) => parseInt(x, 16)));
  for (const b of cmap.match(/beginbfchar[\s\S]*?endbfchar/g) ?? [])
    for (const x of b.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) m.set(x[1].toLowerCase(), uni(x[2]));
  for (const b of cmap.match(/beginbfrange[\s\S]*?endbfrange/g) ?? [])
    for (const x of b.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      const [ini, fin, dst] = [parseInt(x[1], 16), parseInt(x[2], 16), parseInt(x[3], 16)];
      for (let i = ini; i <= fin; i++) m.set(i.toString(16).padStart(4, "0"), String.fromCodePoint(dst + (i - ini)));
    }
  return m;
}

type Segmento = {
  desde: number;   // offset absoluto en data: arranca en el Tm
  hasta: number;   // offset absoluto: donde empieza el próximo Tm, o el ET
  y: number;
  fuenteActiva: string; // el Tf vigente al entrar al segmento
};

/** Corta un bloque en segmentos Tm→Tm, con offsets absolutos sobre data. */
function segmentar(data: string, inicioBloque: number, bloque: string): Segmento[] {
  const tms = [...bloque.matchAll(TM_G)];
  if (!tms.length) return [];
  const finContenido = inicioBloque + bloque.length - 2; // antes del "ET"
  return tms.map((m, i) => ({
    desde: inicioBloque + m.index!,
    hasta: i + 1 < tms.length ? inicioBloque + tms[i + 1].index! : finContenido,
    y: 0, // se completa afuera con el alto de página
    fuenteActiva: "",
    _ty: parseFloat(m[6]),
  })) as (Segmento & { _ty: number })[] as Segmento[];
}

const ORIGEN = process.argv[2] ?? "/home/claude/fase5/cursos/cursos";
const DESTINO = process.argv[3] ?? "/home/claude/fase5/maestros-limpios";
await fs.mkdir(DESTINO, { recursive: true });

for (const archivo of (await fs.readdir(ORIGEN)).sort()) {
  if (!archivo.endsWith(".pdf")) continue;
  const doc = await PDFDocument.load(await fs.readFile(path.join(ORIGEN, archivo)));
  let quitados = 0;

  for (const pagina of doc.getPages()) {
    // ── CMaps de las fuentes ──
    const cmaps = new Map<string, Map<string, string>>();
    const fuentes = pagina.node.Resources()?.lookupMaybe(PDFName.of("Font"), PDFDict);
    if (fuentes)
      for (const [n, r] of fuentes.entries()) {
        const fd = doc.context.lookup(r);
        if (!(fd instanceof PDFDict)) continue;
        const tu = doc.context.lookup(fd.get(PDFName.of("ToUnicode")));
        if (tu instanceof PDFRawStream)
          cmaps.set(n.asString().slice(1), parsearCMap(Buffer.from(decodePDFRawStream(tu).decode()).toString("latin1")));
      }

    // ── Contents ──
    const cRef = pagina.node.get(PDFName.of("Contents"));
    const cObj = doc.context.lookup(cRef);
    const dec = (s: PDFRawStream) => Buffer.from(decodePDFRawStream(s).decode()).toString("latin1");
    let data: string | null = null;
    if (cObj instanceof PDFRawStream) data = dec(cObj);
    else if (cObj instanceof PDFArray) {
      const partes: string[] = [];
      for (let i = 0; i < cObj.size(); i++) {
        const s = doc.context.lookup(cObj.get(i));
        if (s instanceof PDFRawStream) partes.push(dec(s));
      }
      data = partes.join("\n");
    }
    if (!data) continue;

    // ── Segmentar toda la página ──
    const alto = pagina.getHeight();
    const segmentos: (Segmento & { texto: string })[] = [];

    for (const m of data.matchAll(BLOQUE)) {
      const bloque = m[0];
      const base = m.index!;
      const tms = [...bloque.matchAll(TM_G)];
      if (!tms.length) continue;
      const finContenido = base + bloque.length - 2;

      // fuente vigente: puede declararse antes del primer Tm o dentro de un segmento
      let fuenteVigente = bloque.slice(0, tms[0].index!).match(TF)?.[1] ?? "";

      tms.forEach((tm, i) => {
        const desde = base + tm.index!;
        const hasta = i + 1 < tms.length ? base + tms[i + 1].index! : finContenido;
        const cuerpo = data!.slice(desde, hasta);
        fuenteVigente = cuerpo.match(TF)?.[1] ?? fuenteVigente;
        const cmap = cmaps.get(fuenteVigente);
        let texto = "";
        if (cmap)
          for (const h of cuerpo.matchAll(HEX))
            for (const g of h[1].match(/.{4}/g) ?? []) texto += cmap.get(g.toLowerCase()) ?? "";
        segmentos.push({ desde, hasta, y: alto - parseFloat(tm[6]) * ESCALA, fuenteActiva: fuenteVigente, texto });
      });
    }

    // ── Renglones con token ──
    const ysToken = segmentos.filter((s) => s.texto.includes("{{")).map((s) => s.y);
    if (!ysToken.length) continue;

    // Pie (y<40): solo el segmento con token. Cuerpo: el renglón entero.
    const ZONA_PIE = 40;
    const aBorrar = segmentos
      .filter((s) =>
        s.y < ZONA_PIE
          ? s.texto.includes("{{")
          : ysToken.some((y) => Math.abs(y - s.y) < 1.5)
      )
      .sort((a, b) => b.desde - a.desde); // de atrás hacia adelante: no invalida offsets

    let limpio = data;
    for (const s of aBorrar) {
      limpio = limpio.slice(0, s.desde) + limpio.slice(s.hasta);
      quitados++;
    }

    const nuevo = doc.context.flateStream(Buffer.from(limpio, "latin1"));
    pagina.node.set(PDFName.of("Contents"), doc.context.register(nuevo));
    if (cObj instanceof PDFRawStream && cRef && "objectNumber" in cRef) doc.context.delete(cRef as never);
  }

  doc.setProducer("SientoLuz");
  doc.setCreator("SientoLuz");
  await fs.writeFile(path.join(DESTINO, archivo), await doc.save());
  console.log(`${archivo.padEnd(32)} ${String(quitados).padStart(3)} segmentos quitados`);
}
