import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Sesión del /admin · magic link propio.
 *
 * ── Por qué no Supabase Auth ──
 * Es un panel de UN usuario. Supabase Auth traería: configurar el dashboard
 * (desactivar registros, redirect URLs), SMTP propio para que el mail no
 * salga de un dominio ajeno y no choque con su límite de correos del plan
 * free, y manejo de cookies con @supabase/ssr. Todo eso para autenticar a
 * una persona. Acá el mail sale por Resend, con la marca, sin configurar nada.
 *
 * ── Cómo funciona ──
 * 1. Pedís el link. Si el mail es el del dueño, se manda; si no, no pasa
 *    nada — pero la respuesta es idéntica, para no revelar cuál es.
 * 2. El link lleva un token firmado con HMAC-SHA256: {email, exp, nonce}.
 * 3. Al abrirlo, se verifica la firma en tiempo constante y se cambia por
 *    una cookie de sesión httpOnly.
 *
 * ── Lo que NO hace ──
 * El token de entrada no es de un solo uso: vive 15 minutos y dentro de esa
 * ventana se puede volver a usar. Hacerlo único requeriría guardar los
 * nonces gastados en la base. Para un link que solo existe en tu casilla,
 * durante 15 minutos, no vale la tabla. Si algún día el panel tiene más de
 * un usuario, esto se cambia por Supabase Auth y listo.
 */

const TOKEN_MIN = 15;
const SESION_DIAS = 30;
const COOKIE = "sl_admin";

function secreto(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SECRET falta o es muy corto (mínimo 32 caracteres)");
  }
  return s;
}

export function emailAdmin(): string {
  const e = process.env.ADMIN_EMAIL;
  if (!e) throw new Error("ADMIN_EMAIL sin configurar");
  return e.trim().toLowerCase();
}

const b64 = (b: Buffer) => b.toString("base64url");

function firmar(payload: string): string {
  return b64(crypto.createHmac("sha256", secreto()).update(payload).digest());
}

/** Arma un token firmado. `tipo` separa los de entrada de los de sesión. */
function crear(tipo: "link" | "sesion", email: string, minutos: number): string {
  const cuerpo = b64(
    Buffer.from(
      JSON.stringify({
        t: tipo,
        e: email,
        exp: Date.now() + minutos * 60_000,
        n: crypto.randomBytes(9).toString("base64url"),
      })
    )
  );
  return `${cuerpo}.${firmar(cuerpo)}`;
}

/** Verifica firma y vencimiento. Devuelve el email o null. */
function verificar(tipo: "link" | "sesion", token: string | undefined): string | null {
  if (!token) return null;
  const [cuerpo, firma] = token.split(".");
  if (!cuerpo || !firma) return null;

  // Comparación en tiempo constante: un `===` filtra información por
  // cuánto tarda en fallar.
  const esperada = Buffer.from(firmar(cuerpo));
  const recibida = Buffer.from(firma);
  if (esperada.length !== recibida.length) return null;
  if (!crypto.timingSafeEqual(esperada, recibida)) return null;

  try {
    const d = JSON.parse(Buffer.from(cuerpo, "base64url").toString());
    if (d.t !== tipo) return null;
    if (typeof d.exp !== "number" || Date.now() > d.exp) return null;
    if (typeof d.e !== "string" || d.e !== emailAdmin()) return null;
    return d.e;
  } catch {
    return null;
  }
}

export const crearTokenLink = (email: string) => crear("link", email, TOKEN_MIN);
export const verificarTokenLink = (t: string | undefined) => verificar("link", t);

/** Cambia un token de link válido por la cookie de sesión. */
export async function abrirSesion(email: string) {
  const jar = await cookies();
  jar.set(COOKIE, crear("sesion", email, SESION_DIAS * 24 * 60), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESION_DIAS * 24 * 3600,
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

/**
 * El email del admin si hay sesión válida, o null.
 *
 * En dev (`next dev`, NODE_ENV !== "production") se salta la validación:
 * el magic link depende de ADMIN_SECRET/RESEND_API_KEY/NEXT_PUBLIC_SITE_URL
 * apuntando a localhost, y montar todo eso solo para probar el panel no vale
 * la pena. En build de producción esta rama no existe.
 */
export async function sesion(): Promise<string | null> {
  if (process.env.NODE_ENV !== "production") return emailAdmin();
  return verificar("sesion", (await cookies()).get(COOKIE)?.value);
}

export const NOMBRE_COOKIE = COOKIE;
