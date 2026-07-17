import fs from "node:fs/promises";
import path from "node:path";

/**
 * Carga los .ttf de marca desde el disco, con caché en memoria.
 *
 * Por qué no un simple path.join(process.cwd(), …):
 * en serverless, cwd() depende del host y de cómo empaquete la función.
 * En local es la raíz del repo; en un bundle puede ser otra cosa. Probamos
 * varias raíces y, si no está en ninguna, tiramos un error que diga qué
 * pasa — no un ENOENT pelado a las tres de la mañana con una venta colgada.
 *
 * Además hace falta outputFileTracingIncludes en next.config.ts: Next
 * rastrea imports, no fs.readFile, y sin eso los .ttf ni llegan al bundle.
 */

const CANDIDATAS = [
  () => path.join(process.cwd(), "src/fuentes"),
  () => path.join(process.cwd(), ".next/server/src/fuentes"),
  () => path.join(process.cwd(), "../src/fuentes"),
];

const cache = new Map<string, Buffer>();
let raiz: string | null = null;

async function encontrarRaiz(archivo: string): Promise<string> {
  if (raiz) return raiz;
  const probadas: string[] = [];
  for (const c of CANDIDATAS) {
    const dir = c();
    probadas.push(dir);
    try {
      await fs.access(path.join(dir, archivo));
      raiz = dir;
      return dir;
    } catch {
      /* siguiente */
    }
  }
  throw new Error(
    `No encuentro las fuentes de marca (${archivo}). Probé: ${probadas.join(", ")}. ` +
      `Revisá outputFileTracingIncludes en next.config.ts.`
  );
}

export async function fuente(archivo: string): Promise<Buffer> {
  const ya = cache.get(archivo);
  if (ya) return ya;
  const dir = await encontrarRaiz(archivo);
  const buf = await fs.readFile(path.join(dir, archivo));
  cache.set(archivo, buf);
  return buf;
}

export const FUENTES = {
  nunito: "SL-Nunito-Regular.ttf",
  nunitoBold: "SL-Nunito-Bold.ttf",
  josefin: "SL-Josefin-Light.ttf",
  cormorant: "SL-Cormorant-Italic.ttf",
} as const;
