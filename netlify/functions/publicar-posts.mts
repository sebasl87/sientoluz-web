import { filasPendientes, publicarFila } from "../../src/lib/social/cola";

/**
 * Publicador programado de FB + IG.
 *
 * Corre cada 15 min, solo dentro de 08–11 y 15–20 hora Argentina (11–14 y
 * 18–23 UTC — Argentina no tiene horario de verano, el offset -3 es fijo
 * todo el año). Fuera de esas franjas no vale la pena correr: no hay nada
 * para publicar y ahorra invocaciones del plan free.
 *
 * Las filas se procesan en paralelo (Promise.all): las Scheduled Functions
 * de Netlify tienen un límite de 30s de ejecución en todos los planes, y
 * hacerlas secuenciales podría no alcanzar si hay varias juntas. Publicar
 * una no depende de las otras, así que en paralelo es seguro.
 */
export default async () => {
  const ahora = new Date().toISOString();
  const filas = await filasPendientes(ahora);

  await Promise.all(
    filas.flatMap((fila) => [publicarFila(fila, "fb"), publicarFila(fila, "ig")])
  );

  return new Response(JSON.stringify({ ok: true, procesadas: filas.length }), {
    headers: { "content-type": "application/json" },
  });
};

export const config = {
  schedule: "*/15 11-14,18-23 * * *",
};
