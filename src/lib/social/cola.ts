import { supabaseServidor } from "@/lib/supabase";
import { publishToFacebook, publishToInstagram } from "./publish";

/**
 * publicarFila(fila, red) — el corazón de la cola de posts.
 *
 * La llaman dos disparadores, igual que entregar() en el flujo de pagos:
 *   · la Scheduled Function (netlify/functions/publicar-posts.mts), a la hora
 *     programada
 *   · el botón "Publicar ahora" del panel
 *
 * ── Idempotencia ──
 * Antes de publicar, hace un claim optimista: UPDATE ... WHERE <red>_status =
 * 'pending'. Si esa condición ya no se cumple (otra corrida se la ganó, o ya
 * estaba publicado), el UPDATE no toca ninguna fila y esta llamada no hace
 * nada más. Así una corrida del cron solapada con otra, o un doble clic en
 * "Publicar ahora", nunca duplican el post.
 *
 * Cada red (fb/ig) es independiente: si Facebook falla, Instagram igual se
 * intenta, y el reintento posterior solo toca la red que falló.
 */

export type Red = "fb" | "ig";

export type PostProgramado = {
  id: string;
  caption: string;
  hashtags: string | null;
  image_url: string;
  publish_fb: boolean;
  publish_ig: boolean;
  fb_status: string;
  ig_status: string;
  attempts: number;
};

const ESTADOS_ABIERTOS = ["pending", "publishing"];

function textoCompleto(fila: Pick<PostProgramado, "caption" | "hashtags">) {
  return fila.hashtags ? `${fila.caption}\n\n${fila.hashtags}` : fila.caption;
}

/** Publica (o saltea) una red de una fila. No tira: el error queda guardado en la fila. */
export async function publicarFila(fila: PostProgramado, red: Red): Promise<void> {
  const db = supabaseServidor();
  const columnaEstado = `${red}_status`;
  const columnaPostId = `${red}_post_id`;
  const columnaError = `${red}_error`;
  const debePublicar = red === "fb" ? fila.publish_fb : fila.publish_ig;

  if (!debePublicar) {
    await db.from("posts_programados").update({ [columnaEstado]: "skipped" }).eq("id", fila.id);
    await cerrarSiCorresponde(fila.id);
    return;
  }

  // Claim optimista: si otra corrida ya se llevó esta fila, count queda en 0
  // y no seguimos.
  const claim = await db
    .from("posts_programados")
    .update({ [columnaEstado]: "publishing" })
    .eq("id", fila.id)
    .eq(columnaEstado, "pending")
    .select("id");
  if (claim.error || !claim.data || claim.data.length === 0) return;

  try {
    const caption = textoCompleto(fila);
    const postId =
      red === "fb"
        ? await publishToFacebook(fila.image_url, caption)
        : await publishToInstagram(fila.image_url, caption);

    await db
      .from("posts_programados")
      .update({ [columnaEstado]: "published", [columnaPostId]: postId, [columnaError]: null })
      .eq("id", fila.id);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    await db
      .from("posts_programados")
      .update({
        [columnaEstado]: "failed",
        [columnaError]: mensaje,
        attempts: fila.attempts + 1,
      })
      .eq("id", fila.id);
  }

  await cerrarSiCorresponde(fila.id);
}

/** Si ninguna red sigue pending/publishing, marca published_at. */
async function cerrarSiCorresponde(id: string) {
  const db = supabaseServidor();
  const { data } = await db
    .from("posts_programados")
    .select("fb_status, ig_status, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.published_at) return;

  const sigueAbierta =
    ESTADOS_ABIERTOS.includes(data.fb_status) || ESTADOS_ABIERTOS.includes(data.ig_status);
  if (sigueAbierta) return;

  await db
    .from("posts_programados")
    .update({ published_at: new Date().toISOString() })
    .eq("id", id);
}

export const MAX_INTENTOS = 3;

const COLUMNAS =
  "id, caption, hashtags, image_url, publish_fb, publish_ig, fb_status, ig_status, attempts";

/**
 * Trae las filas que el cron tiene que procesar: programadas para ya, con
 * alguna red todavía en 'pending'. Una red 'failed' no vuelve a aparecer acá
 * sola — el cron no reintenta automático. El reintento es manual, desde el
 * panel (ver reintentarRed), justamente para no insistir contra un token
 * vencido o un límite de la API sin que alguien se entere.
 */
export async function filasPendientes(hastaUtc: string) {
  const db = supabaseServidor();
  const { data, error } = await db
    .from("posts_programados")
    .select(COLUMNAS)
    .lte("scheduled_at", hastaUtc)
    .or("fb_status.eq.pending,ig_status.eq.pending");
  if (error) throw new Error(error.message);
  return (data ?? []) as PostProgramado[];
}

export async function obtenerFila(id: string): Promise<PostProgramado | null> {
  const db = supabaseServidor();
  const { data } = await db.from("posts_programados").select(COLUMNAS).eq("id", id).maybeSingle();
  return (data as PostProgramado) ?? null;
}

/**
 * Reintento manual desde el panel para una red en 'failed'. Vuelve a
 * 'pending' (si no se pasó del cap de intentos) y publica en el momento.
 */
export async function reintentarRed(id: string, red: Red): Promise<void> {
  const db = supabaseServidor();
  const columnaEstado = `${red}_status`;

  const { data: fila, error } = await db
    .from("posts_programados")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();
  if (error || !fila) throw new Error(error?.message ?? "Post inexistente");
  if ((fila as PostProgramado).attempts >= MAX_INTENTOS) {
    throw new Error("Se alcanzó el máximo de reintentos. Revisar manualmente.");
  }

  const reset = await db
    .from("posts_programados")
    .update({ [columnaEstado]: "pending" })
    .eq("id", id)
    .eq(columnaEstado, "failed")
    .select("id");
  if (reset.error) throw new Error(reset.error.message);
  if (!reset.data || reset.data.length === 0) return; // ya no estaba 'failed'

  await publicarFila(fila as PostProgramado, red);
}
