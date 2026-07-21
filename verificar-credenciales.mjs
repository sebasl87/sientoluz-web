/**
 * verificar-credenciales.mjs
 * SientoLuz · Chequeo NO destructivo de las credenciales de Meta (FB + IG).
 * No publica nada: valida token, permisos, vencimiento y el vínculo con Instagram.
 *
 * Uso:
 *   node --env-file=.env.local verificar-credenciales.mjs
 *   (Requiere Node 18+ por el fetch global.)
 */

const V = "v25.0";
const BASE = `https://graph.facebook.com/${V}`;

// ---- Leer credenciales del entorno ----
const {
  META_APP_ID,
  META_APP_SECRET,
  FB_PAGE_ID,
  FB_PAGE_ACCESS_TOKEN,
  IG_USER_ID,
} = process.env;

const faltan = Object.entries({
  META_APP_ID,
  META_APP_SECRET,
  FB_PAGE_ID,
  FB_PAGE_ACCESS_TOKEN,
  IG_USER_ID,
}).filter(([, v]) => !v).map(([k]) => k);

if (faltan.length) {
  console.error("❌ Faltan variables de entorno:", faltan.join(", "));
  process.exit(1);
}

const ok = (m) => console.log(`✅ ${m}`);
const bad = (m) => console.log(`❌ ${m}`);

async function getJSON(url) {
  const r = await fetch(url);
  const j = await r.json();
  if (j.error) throw new Error(`${j.error.message} (code ${j.error.code})`);
  return j;
}

// Permisos que el token DEBE tener para publicar en FB + IG.
const PERMISOS_NECESARIOS = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
];

async function main() {
  console.log("\n🔎 Verificando credenciales de SientoLuz...\n");

  // 1) Debug del token: validez, permisos y vencimiento.
  try {
    const appToken = `${META_APP_ID}|${META_APP_SECRET}`;
    const dbg = await getJSON(
      `${BASE}/debug_token?input_token=${FB_PAGE_ACCESS_TOKEN}&access_token=${appToken}`
    );
    const d = dbg.data;

    if (d.is_valid) ok("El token es válido.");
    else bad("El token NO es válido.");

    // Vencimiento
    if (d.expires_at === 0) {
      ok("El token no expira (never).");
    } else {
      const fecha = new Date(d.expires_at * 1000);
      const dias = Math.round((d.expires_at * 1000 - Date.now()) / 86400000);
      ok(`Vence el ${fecha.toLocaleDateString("es-AR")} (~${dias} días).`);
    }

    // Permisos presentes
    const scopes = d.scopes ?? [];
    const faltantes = PERMISOS_NECESARIOS.filter((p) => !scopes.includes(p));
    if (faltantes.length === 0) ok("Están los 5 permisos clave para publicar.");
    else bad(`Faltan permisos en el token: ${faltantes.join(", ")}`);
  } catch (e) {
    bad(`Debug del token falló: ${e.message}`);
  }

  // 2) La página responde con su nombre (confirma el page token).
  try {
    const page = await getJSON(
      `${BASE}/${FB_PAGE_ID}?fields=name&access_token=${FB_PAGE_ACCESS_TOKEN}`
    );
    ok(`Página de Facebook alcanzada: "${page.name}".`);
  } catch (e) {
    bad(`No pude leer la página: ${e.message}`);
  }

  // 3) La cuenta de Instagram responde (confirma el vínculo y el permiso).
  try {
    const ig = await getJSON(
      `${BASE}/${IG_USER_ID}?fields=username,name&access_token=${FB_PAGE_ACCESS_TOKEN}`
    );
    ok(`Instagram alcanzado: @${ig.username}.`);
  } catch (e) {
    bad(`No pude leer Instagram: ${e.message}`);
  }

  console.log("\n— Fin del chequeo —\n");
}

main().catch((e) => {
  console.error("Error inesperado:", e);
  process.exit(1);
});
