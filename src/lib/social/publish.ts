/**
 * publishToFacebook / publishToInstagram — funciones puras.
 *
 * Las llama tanto la Scheduled Function (netlify/functions/publicar-posts.mts)
 * como el botón "Publicar ahora" del panel, vía lib/social/cola.ts. Acá no se
 * toca Supabase ni se decide nada de estado: solo se habla con la Graph API.
 *
 * El page token (FB_PAGE_ACCESS_TOKEN) sirve para las dos redes, porque la
 * cuenta de Instagram está vinculada a la página de Facebook.
 */

const GRAPH_BASE = "https://graph.facebook.com/v25.0";

const POLL_INTERVALO_MS = 3_000;
// Netlify limita las Scheduled Functions a 30s de ejecución (todos los
// planes, incluido Free). 60s de spec original no entraría nunca: se
// achica a 18s (deja margen para el resto de los pasos) y, si Instagram
// no terminó de procesar en ese lapso, la fila queda 'failed' y se
// reintenta a mano desde el panel — reintentar es seguro, ver cola.ts.
const POLL_TIMEOUT_MS = 18_000;

function env(nombre: string): string {
  const v = process.env[nombre];
  if (!v) throw new Error(`Falta la variable de entorno ${nombre}`);
  return v;
}

type ErrorGraph = { error?: { message?: string; type?: string; code?: number } };

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    method: "POST",
    body: new URLSearchParams(params),
  });
  const data = (await res.json().catch(() => ({}))) as T & ErrorGraph;
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Graph API respondió ${res.status} en ${path}`);
  }
  return data;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${GRAPH_BASE}${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  const data = (await res.json().catch(() => ({}))) as T & ErrorGraph;
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Graph API respondió ${res.status} en ${path}`);
  }
  return data;
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Publica una foto en la página de Facebook. Devuelve el post_id publicado. */
export async function publishToFacebook(imageUrl: string, caption: string): Promise<string> {
  const pageId = env("FB_PAGE_ID");
  const accessToken = env("FB_PAGE_ACCESS_TOKEN");

  const data = await graph<{ id?: string; post_id?: string }>(`/${pageId}/photos`, {
    url: imageUrl,
    caption,
    access_token: accessToken,
  });

  const id = data.post_id ?? data.id;
  if (!id) throw new Error("Facebook no devolvió un post_id");
  return id;
}

/**
 * Publica en Instagram: sube el media (paso 1), espera a que Meta lo procese
 * (paso 2, polling) y recién ahí lo publica (paso 3). No hay forma de saltarse
 * el polling: media_publish falla si el media todavía no está FINISHED.
 */
export async function publishToInstagram(imageUrl: string, caption: string): Promise<string> {
  const igUserId = env("IG_USER_ID");
  const accessToken = env("FB_PAGE_ACCESS_TOKEN");

  const creado = await graph<{ id?: string }>(`/${igUserId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  });
  const creationId = creado.id;
  if (!creationId) throw new Error("Instagram no devolvió un creation_id");

  const desde = Date.now();
  for (;;) {
    const estado = await graphGet<{ status_code?: string }>(`/${creationId}`, {
      fields: "status_code",
      access_token: accessToken,
    });

    if (estado.status_code === "FINISHED") break;
    if (estado.status_code === "ERROR" || estado.status_code === "EXPIRED") {
      throw new Error(`Instagram no pudo procesar la imagen (status_code: ${estado.status_code})`);
    }
    if (Date.now() - desde > POLL_TIMEOUT_MS) {
      throw new Error("Instagram tardó demasiado en procesar la imagen (timeout 60s)");
    }
    await espera(POLL_INTERVALO_MS);
  }

  const publicado = await graph<{ id?: string }>(`/${igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: accessToken,
  });
  if (!publicado.id) throw new Error("Instagram no devolvió un media_id al publicar");
  return publicado.id;
}
