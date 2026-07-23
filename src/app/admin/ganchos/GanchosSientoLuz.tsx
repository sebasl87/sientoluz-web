"use client";

import { useRef, useState } from "react";

/* ============================================================
   SientoLuz · Generador de ganchos (3 en 1)
   Solapa NOMBRE → Número de Alma (gancho 1)
   Solapa FECHA  → Talento (gancho 2) + Vibración Anual (gancho 3)
   Cálculos fieles al sistema del curso. Sin dependencias ni red.
   Colocá este archivo junto a tu page.tsx del panel.
   ============================================================ */

/* ---------- Tipos ---------- */
type Voc = { ch: string; v: number };
type Alma = { alma: number; bruto: number; voc: Voc[] };
type Fecha = {
  talento: number; vib: number;
  camino: number; caminoTotal: number; karmico: number | null;
  dd: number; mm: number; anioCumple: number;
};
type Lead = { cid: string; k: string; chip: string; nm: string; u: string; saved: "pendiente" | "ok" | "no" };
type Mode = "camino" | "talento" | "vibra" | "ambos";

/* ---------- Cálculos ---------- */
const VAL: Record<string, number> = { a: 1, e: 5, i: 9, o: 6, u: 3 };
const sumDig = (n: number): number => String(n).split("").reduce((a, d) => a + +d, 0);
const clean = (s: string): string => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const reduceMaster = (n: number): number => { while (n > 9 && ![11, 22, 33].includes(n)) n = sumDig(n); return n; };
const reduce9 = (n: number): number => { while (n > 9) n = sumDig(n); return n; };

function calcAlma(nombre: string): Alma {
  const letras = clean(nombre).replace(/[^a-z ]/g, "");
  const voc: Voc[] = [];
  for (const ch of letras) if (VAL[ch] !== undefined) voc.push({ ch: ch.toUpperCase(), v: VAL[ch] });
  const bruto = voc.reduce((a, x) => a + x.v, 0);
  return { alma: reduceMaster(bruto), bruto, voc };
}
function calcFecha(fechaStr: string): Fecha {
  const [yy, mm, dd] = fechaStr.split("-").map(Number);
  const talento = reduce9(dd);
  const hoy = new Date();
  const cumpleEste = new Date(hoy.getFullYear(), mm - 1, dd);
  const anioCumple = hoy >= cumpleEste ? hoy.getFullYear() : hoy.getFullYear() - 1;
  const vib = reduce9(sumDig(dd) + sumDig(mm) + sumDig(anioCumple));
  // Camino de Vida = fecha de nacimiento completa (en la carta: Karma)
  const caminoTotal = sumDig(dd) + sumDig(mm) + sumDig(yy);
  const karmico = [13, 14, 16, 19].includes(caminoTotal) ? caminoTotal : null;
  const camino = [11, 22, 33].includes(caminoTotal) ? caminoTotal : reduce9(caminoTotal);
  return { talento, vib, camino, caminoTotal, karmico, dd, mm, anioCumple };
}
const primerNombre = (s: string): string => {
  if (!s) return "";
  const t = s.trim().split(/\s+/);
  return t[0] ? t[0].charAt(0).toUpperCase() + t[0].slice(1) : s;
};

/* ---------- Textos fieles al curso ---------- */
const ALMA: Record<number, string> = {
  1: "Sos un alma de líder natural. Tu Yo interno necesita autonomía, animarse y que se reconozca lo que hacés. Viniste a ser más, a confiar en vos y a no depender.",
  2: "Tu alma busca armonía y paz por sobre todo. Sos emotiva, tierna, romántica y muy creativa: no necesitás brillar, necesitás vivir tranquila y en vínculo.",
  3: "Tu alma se expresa. Es sensible, alegre y comunicativa: viniste a disfrutar los momentos y a compartir con el mundo eso que sentís y creás.",
  4: "Tu alma busca estabilidad y bases firmes. Sos constructora: necesitás orden, seguridad y algo sólido sobre lo cual sostener tu vida.",
  5: "Tu alma es puro movimiento: mucha energía, amor por la libertad, independiente y algo rebelde. Viniste a romper esquemas y a contagiar a otros para que se reinventen.",
  6: "Tu alma es protectora y entregada. Buscás estabilidad emocional, tu propio hogar y una familia —de sangre o elegida— a la que cuidar.",
  7: "Tu alma busca profundidad y verdad. Viniste a alcanzar el poder a través del conocimiento, desde el silencio, la observación y la intuición.",
  8: "Tu alma es emprendedora, ambiciosa y de gran escala. Viniste a construir proyectos grandes y a materializar tu propia prosperidad.",
  9: "Tu alma es solidaria, idealista y desinteresada. Viniste a brillar y a servir de guía; para vos no hay barreras que te frenen a la hora de ayudar.",
  11: "Tenés un Número Maestro: el 11. Un alma de senda espiritual, muy intuitiva —a veces casi clarividente— y con un potencial enorme. Primero se integra la energía del 2 y después se potencia.",
  22: "Tenés un Número Maestro: el 22. Un alma de vibración altísima, la del gran constructor: capaz de materializar cosas grandes al servicio de muchos.",
  33: "Tenés un Número Maestro: el 33. Un alma de vibración muy alta, ligada al amor y a la enseñanza; un canal para acompañar y elevar a otros.",
};
const TALENTO: Record<number, string> = {
  1: "iniciar, arrancar, empuje y fortaleza para atravesar cualquier obstáculo",
  2: "conectar con la intuición, mucha empatía y persistencia para superar lo que venga",
  3: "sos espontánea y muy magnética; vencés los obstáculos con tus propias aptitudes",
  4: "el gran constructor: disciplina, orden y capacidad para concretar lo que te proponés",
  5: "magnetismo y poder de convencer; sabés adaptarte, moverte y usar tus encantos",
  6: "paciencia, perdón, aceptación y una gran vocación de servicio y cuidado del otro",
  7: "muy buena administradora de recursos: sabés llevar la economía, ahorrás y no derrochás",
  8: "autosuficiente: hacés de lo más mínimo un éxito, gran administradora",
  9: "muy humana: das mucho y vivís alineada a tus principios",
};
const VIBRA: Record<number, string> = {
  1: "un año para empezar, iniciar todo lo que te propongas y ser más independiente",
  2: "un año para escuchar tu intuición, servir, cooperar y no bajar los brazos",
  3: "un año para disfrutar, expresarte, conectar con lo social y hacer cursos cortos",
  4: "un año para concretar proyectos —trabajoso pero se logra— y afianzar pareja y familia",
  5: "un año de cambios, movimiento, mudanzas y viajes",
  6: "un año para ser servicial, dedicarte al otro, no dejar cosas pendientes y evitar discusiones",
  7: "un año para la introspección: meditar más que nunca, ocuparte de vos y perfeccionarte",
  8: "un año de pruebas para soltar lo material… con una suerte extra: lo que te propongas, lo lográs",
  9: "un año para soltar, sanar y cerrar: termina un ciclo de 9 años y viene algo mejor",
};

/* Camino de Vida — "dónde está tu fuerza" (aspectos positivos del número) */
const CAM_FUERZA: Record<number, string> = {
  1: "tu energía es altísima. Te animás, iniciás, creás. Tenés mucha voluntad y ves más allá de lo que ve el resto",
  2: "sos diplomática, receptiva y mediadora. Tenés una conexión finísima con lo intuitivo y sabés unir a la gente",
  3: "la expresión es tuya: creatividad, sensibilidad y alegría. Sabés disfrutar los momentos y contagiarlos",
  4: "sos la gran constructora: paciente, disciplinada, organizada. Te lleva trabajo concretar, pero lo lográs",
  5: "libertad y movimiento. Flexible, independiente, magnética: sabés usar tus encantos y reinventarte",
  6: "perdonás y sabés esperar. Te aceptás y aceptás al resto, con compasión y una enorme vocación de servicio",
  7: "profundidad. Sabiduría interna, análisis, meditación: te hacés las preguntas grandes y las sostenés",
  8: "autosuficiente y ambiciosa del mejor modo: hacés de lo más mínimo un éxito y administrás como pocas",
  9: "humanitaria, compasiva y sabia. Carismática, y das sin esperar nada a cambio",
};
/* Camino de Vida — "las trampas que se repiten" (texto de Karma del curso) */
const CAM_LECCION: Record<number, string> = {
  1: "aprender a trabajar la independencia, ser más individualista y saber administrar tu economía sin depender del otro",
  2: "servir a los demás: vivir para el otro, ayudando a que evolucione y sane",
  3: "aprender a expresarte, de la manera que sea, en aquello donde sentís que tenés talento",
  4: "aprender a administrarte de forma práctica y eficiente. Poner en práctica la organización y la disciplina hasta ver resultados",
  5: "el amor. No encontrar a la persona adecuada, o sentirte sola estando acompañada. Encontrar ahí el equilibrio",
  6: "aprender a no buscar el conflicto y a afrontar las cosas de otro modo. Formar una familia en armonía",
  7: "encontrar en la vida un lugar para vos: en el mundo, en el trabajo, en tu hogar, en tu familia",
  8: "la vida te va a poner siempre a prueba. Es una vida de muchos aprendizajes: comprender que todo lo que hacemos tiene consecuencias",
  9: "el sentimiento de rechazo o de no ser comprendida por tu círculo más cercano. Tu búsqueda va a ser el reconocimiento",
};

/* ---------- Banco de mensajes ---------- */
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const CIERRE = [
  "Cualquier cosa quedo por acá 💜",
  "Si querés que te cuente cómo es el curso, escribime 'quiero' y te paso todo 🌿",
  "Gracias por dejarme mirar un ratito tu energía 🌙",
  "Te mando un abrazo de luz ✨",
  "Si te dieron ganas de seguir, avisame y vemos juntas 💫",
];
const SAL_ALMA = [
  "Hola {n} 🌙 Me quedé con ganas de hacer tu número apenas leí tu mensaje.",
  "{n}, gracias por escribir 💜 Fui a las vocales de tu nombre y esto encontré.",
  "Hola {n} ✨ Te calculé tu Número de Alma con tu nombre completo, mirá.",
  "Qué lindo tu nombre, {n} 🌿 Ya tenés tu Número de Alma listo.",
  "Hola {n} 🌙 Tomé tu nombre y dejé que hablaran las vocales.",
];
const REV_ALMA = [
  "Tu Número de Alma es el {a}.",
  "El Alma te vibra en {a}.",
  "Tu esencia se resume en un número: el {a}.",
  "Las vocales de tu nombre suman {a} — ese es tu Número de Alma.",
];
const PUENTE_ALMA = [
  "Y esto es apenas una punta 🌱 El Alma es uno de los muchos números de tu Carta (Personalidad, Karma, Misión, Talento…). Verte entera es donde se pone hermoso.",
  "Ojo que esto es solo tu Alma 💫 Falta tu Personalidad, tu Karma, tu Misión… Todo eso lo trabajamos paso a paso en el curso de Numerología de SientoLuz.",
  "Tu Alma es una sola pieza del mapa 🗺️ En el curso aprendés a armar tu Carta completa y la de quien quieras: tus hijos, tu pareja, tus amigas.",
  "Si esto te resonó, imaginate tu Carta entera 🌙 Es lo que ves en el curso: te llevás todo el material para leerte y leer a otros.",
];
const SAL_NAME = [
  "Hola {n} ☀️ Miré tu fecha y esto es lo que salió.",
  "{n}, gracias por tu fecha 💛 Tu día de nacimiento habla, y bastante.",
  "Hola {n} ✨ Tu fecha me contó algo lindo.",
  "Qué bueno, {n} 🌿 Con tu fecha ya tengo lo tuyo.",
];
const SAL_ANON = [
  "¡Hola! ☀️ Miré tu fecha y esto es lo que salió.",
  "Gracias por tu fecha 💛 Tu día de nacimiento habla, y bastante.",
  "¡Hola! ✨ Tu fecha me contó algo lindo.",
  "Acá va lo tuyo 🌿 Con tu fecha ya tengo el número.",
];
const SAL_CAM = [
  "Hola {n} 💜 Acá va tu Camino de Vida, como prometí.",
  "{n}, gracias por dejarme tu fecha 🌙 Ya saqué tu Camino de Vida.",
  "Hola {n} ✨ Sumé tu fecha completa y este es el terreno que te tocó caminar.",
  "Llegué, {n} 🌿 Este es tu Camino de Vida.",
];
const SAL_CAM_ANON = [
  "¡Hola! 💜 Acá va tu Camino de Vida, como prometí.",
  "Gracias por dejarme tu fecha 🌙 Ya saqué tu Camino de Vida.",
  "¡Hola! ✨ Sumé tu fecha completa y este es el terreno que te tocó caminar.",
  "Llegué 🌿 Este es tu Camino de Vida.",
];
const REV_CAM = [
  "Tu Camino de Vida es el {c}.",
  "El número que se te viene repitiendo es el {c}.",
  "Tu fecha completa da {c}: ese es tu Camino de Vida.",
];
const REV_TAL = ["Por dónde brillás es el {t}.", "Tu don vibra en {t}.", "Tu Talento es un {t}."];
const REV_VIB = ["La energía de tu año está en {v}.", "Tu año personal es un {v}.", "Tu Vibración Anual es {v}."];
const PUENTE_F = [
  "Y todo esto salió solo de tu fecha 🌙 Con tu nombre completo se suman tu Alma, tu Personalidad, tu Karma, tu Misión… y se arma tu Carta entera. Ahí está lo bueno.",
  "Ojo que la fecha es la mitad de la historia 💫 La otra mitad vive en tu nombre. Todo junto es la Carta Numerológica que ves en el curso de SientoLuz.",
  "Imaginate esto pero completo 🗺️ Con fecha + nombre armás tu Carta entera y la de quien quieras. Eso es lo que aprendés en el curso.",
  "Tu fecha ya dijo un montón ✨ y todavía falta lo que dice tu nombre. La Carta completa es el corazón del curso de Numerología.",
];

function msgAlma(nombre: string, alma: number): string {
  const n = primerNombre(nombre);
  const s = pick(SAL_ALMA).replace(/{n}/g, n);
  const r = pick(REV_ALMA).replace(/{a}/g, String(alma));
  const interp = ALMA[alma] ?? ALMA[reduce9(alma)];
  return `${s}\n\n${r}\n\n${interp}\n\n${pick(PUENTE_ALMA)}\n\n${pick(CIERRE)}`;
}
function msgFecha(nombre: string, res: Fecha, mode: Mode): string {
  const n = primerNombre(nombre);
  const cam = mode === "camino";
  const s = (cam
          ? (n ? pick(SAL_CAM) : pick(SAL_CAM_ANON))
          : (n ? pick(SAL_NAME) : pick(SAL_ANON))
  ).replace(/{n}/g, n);
  const bloques: string[] = [];
  if (cam) {
    const base = reduce9(res.camino);
    bloques.push(pick(REV_CAM).replace(/{c}/g, String(res.camino)));
    bloques.push(`Dónde está tu fuerza: ${CAM_FUERZA[base]}.`);
    bloques.push(`Lo que se te repite hasta que lo aprendas: ${CAM_LECCION[base]}.`);
    if ([11, 22, 33].includes(res.camino)) {
      bloques.push(`Y algo más: el ${res.camino} es un Número Maestro, de vibración muy alta. Para poder usarlo, primero se integra la energía del ${base}.`);
    }
    if (res.karmico) {
      bloques.push("Tu número trae además una capa extra que no se explica en dos líneas. Eso se ve entero en la carta completa.");
    }
    bloques.push("(En la carta numerológica lo vas a encontrar como tu número de Karma: es el mismo número, con el nombre técnico.)");
  }
  if (mode === "talento" || mode === "ambos") {
    bloques.push(pick(REV_TAL).replace(/{t}/g, String(res.talento)));
    bloques.push(`Tu don (Talento ${res.talento}): ${TALENTO[res.talento]}.`);
  }
  if (mode === "vibra" || mode === "ambos") {
    bloques.push(pick(REV_VIB).replace(/{v}/g, String(res.vib)));
    bloques.push(`Tu año (Vibración ${res.vib}): ${VIBRA[res.vib]}.`);
  }
  return `${s}\n\n${bloques.join("\n\n")}\n\n${pick(PUENTE_F)}\n\n${pick(CIERRE)}`;
}

const MESES = ["", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/* ---------- Copiado robusto ----------
   navigator.clipboard sólo existe en contexto seguro (HTTPS o localhost).
   Si no está, caemos a un textarea temporal + execCommand.            */
async function copiar(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch { /* seguimos al fallback */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length); // iOS
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/* ============================================================ */
export default function GanchosSientoLuz() {
  const [tab, setTab] = useState<"nombre" | "fecha">("nombre");
  const [nombre, setNombre] = useState("");
  const [userN, setUserN] = useState("");
  const [alma, setAlma] = useState<Alma | null>(null);
  const [fecha, setFecha] = useState("");
  const [fNombre, setFNombre] = useState("");
  const [userF, setUserF] = useState("");
  const [fres, setFres] = useState<Fecha | null>(null);
  const [mode, setMode] = useState<Mode>("camino");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const [toastOk, setToastOk] = useState(true);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [canal, setCanal] = useState("facebook");

  // Guarda el lead en Supabase vía /api/leads (server). Falla en silencio:
  // copiar el mensaje es lo crítico; guardar es secundario.
  const guardarLead = async (
      payload: { gancho: string; numero: string; nombre: string; usuario: string; canal: string; fecha_nac: string | null },
      cid: string
  ) => {
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setLeads((L) => L.map((x) => (x.cid === cid ? { ...x, saved: r.ok ? "ok" : "no" } : x)));
    } catch {
      setLeads((L) => L.map((x) => (x.cid === cid ? { ...x, saved: "no" } : x)));
    }
  };
  const nuevoCid = () =>
      (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

  const genNombre = (autoCopy = false) => {
    setErr("");
    if (nombre.trim().length < 2) { setErr("Escribí el nombre completo."); return; }
    const r = calcAlma(nombre);
    if (!r.voc.length) { setErr("Ese nombre no tiene vocales reconocibles."); return; }
    setAlma(r);
    const texto = msgAlma(nombre, r.alma);
    setMsg(texto);
    const cid = nuevoCid();
    setLeads((L) => [{ cid, k: "Alma", chip: `A${r.alma}`, nm: nombre.trim(), u: userN.trim(), saved: "pendiente" }, ...L]);
    guardarLead({ gancho: "alma", numero: String(r.alma), nombre: nombre.trim(), usuario: userN.trim(), canal, fecha_nac: null }, cid);
    if (autoCopy) copiarYAvisar(texto);
  };
  const genFecha = (m: Mode = mode, autoCopy = false) => {
    setErr("");
    if (!fecha) { setErr("Elegí la fecha de nacimiento."); return; }
    const r = calcFecha(fecha);
    setFres(r); setMode(m);
    const texto = msgFecha(fNombre, r, m);
    setMsg(texto);
    const etq = m === "camino" ? `C${r.camino}` : m === "talento" ? `T${r.talento}` : m === "vibra" ? `A${r.vib}` : `T${r.talento}·A${r.vib}`;
    const k = m === "camino" ? "Camino" : m === "talento" ? "Talento" : m === "vibra" ? "Año" : "Fecha";
    const numero = m === "camino" ? String(r.camino) : m === "talento" ? String(r.talento) : m === "vibra" ? String(r.vib) : `${r.talento}·${r.vib}`;
    const cid = nuevoCid();
    setLeads((L) => [{ cid, k, chip: etq, nm: fNombre.trim() || "(sin nombre)", u: userF.trim(), saved: "pendiente" }, ...L]);
    guardarLead({ gancho: m, numero, nombre: fNombre.trim(), usuario: userF.trim(), canal, fecha_nac: fecha }, cid);
    if (autoCopy) copiarYAvisar(texto);
  };
  const regen = () => {
    if (tab === "nombre" && alma) setMsg(msgAlma(nombre, alma.alma));
    if (tab === "fecha" && fres) setMsg(msgFecha(fNombre, fres, mode));
  };
  const aviso = (t: string, ok: boolean) => {
    setToast(t); setToastOk(ok);
    setTimeout(() => setToast(""), ok ? 1800 : 4000);
  };
  const copy = async () => {
    const ok = await copiar(msg);
    if (ok) { aviso("¡Copiado! ✨", true); return; }
    // Último recurso: seleccionamos el texto para que lo copie a mano.
    taRef.current?.focus();
    taRef.current?.select();
    aviso("No pude copiar solo. Te dejé el texto seleccionado: Ctrl/Cmd+C", false);
  };
  const copiarYAvisar = async (texto: string) => {
    const ok = await copiar(texto);
    if (ok) { aviso("¡Revelado y copiado! ✨", true); return; }
    taRef.current?.focus();
    taRef.current?.select();
    aviso("Revelado. No pude copiar solo: Ctrl/Cmd+C", false);
  };
  const copyLeads = async () => {
    if (!leads.length) return;
    const txt = leads.map((l) => `${l.nm} | ${l.u || "-"} | ${l.k} ${l.chip}`).join("\n");
    const ok = await copiar(txt);
    aviso(ok ? "Lista copiada ✨" : "No pude copiar la lista.", ok);
  };

  return (
      <div className="sl">
        <style>{CSS}</style>

        <header className="sl-head">
          <div className="sl-moon" />
          <div className="sl-brand">Siento<b>Luz</b></div>
        </header>
        <div className="sl-eyebrow">Generador de ganchos</div>
        <h1 className="sl-h1">Regalá un número, ganá un lead</h1>

        <div className="sl-tabs">
          <button className={"sl-tab" + (tab === "nombre" ? " on" : "")} onClick={() => { setTab("nombre"); setMsg(""); setErr(""); }}>🌙 Nombre → Alma</button>
          <button className={"sl-tab" + (tab === "fecha" ? " on" : "")} onClick={() => { setTab("fecha"); setMsg(""); setErr(""); }}>☀️ Fecha → Talento + Año</button>
        </div>

        {tab === "nombre" && (
            <div className="sl-panel">
              <p className="sl-sub">El Alma sale de las vocales del nombre completo (con los dos apellidos), igual que en el curso.</p>
              <div className="sl-row">
                <div className="grow"><label>Nombre completo</label>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)}
                         onKeyDown={(e) => e.key === "Enter" && genNombre()} placeholder="Ej.: María Luz Gómez Díaz" /></div>
                <div className="short"><label>@usuario</label>
                  <input value={userN} onChange={(e) => setUserN(e.target.value)} placeholder="@nombre" /></div>
                <div className="short"><label>Canal</label>
                  <select value={canal} onChange={(e) => setCanal(e.target.value)}>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="grupo_fb">Grupo FB</option>
                    <option value="otro">Otro</option>
                  </select></div>
              </div>
              <div className="sl-actions">
                <button className="sl-primary" onClick={() => genNombre()}>Revelar el Alma ✨</button>
                <button className="sl-jade" onClick={() => genNombre(true)}>Revelar y copiar ✨</button>
                {err && <span className="sl-err">{err}</span>}
              </div>

              {alma && (
                  <div className="sl-reveal night">
                    <div className="stars" />
                    <div className="rhead">Número de Alma</div>
                    <div className="rname">{primerNombre(nombre)}</div>
                    <div className="rnum">{alma.alma}<small>número de alma</small></div>
                    <div className="chips">{alma.voc.map((v, i) => <span key={i} className="chip">{v.ch}<b>{v.v}</b></span>)}</div>
                    <div className="rfoot">Suma de vocales: {alma.bruto}{alma.bruto !== alma.alma ? ` → ${alma.alma}` : ""}</div>
                  </div>
              )}
            </div>
        )}

        {tab === "fecha" && (
            <div className="sl-panel">
              <p className="sl-sub">De la fecha salen el <b>Talento</b> (una publi) y la <b>Vibración Anual</b> (otra campaña). Elegí de cuál querés el mensaje.</p>
              <div className="sl-row">
                <div className="grow"><label>Fecha de nacimiento</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
                <div className="grow"><label>Nombre (opcional)</label>
                  <input value={fNombre} onChange={(e) => setFNombre(e.target.value)} placeholder="Ej.: María" /></div>
                <div className="short"><label>@usuario</label>
                  <input value={userF} onChange={(e) => setUserF(e.target.value)} placeholder="@nombre" /></div>
                <div className="short"><label>Canal</label>
                  <select value={canal} onChange={(e) => setCanal(e.target.value)}>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="grupo_fb">Grupo FB</option>
                    <option value="otro">Otro</option>
                  </select></div>
              </div>

              <div className="sl-seg">
                <button className={mode === "camino" ? "on" : ""} onClick={() => fres ? genFecha("camino") : setMode("camino")}>Camino de Vida</button>
                <button className={mode === "talento" ? "on" : ""} onClick={() => fres ? genFecha("talento") : setMode("talento")}>Talento</button>
                <button className={mode === "vibra" ? "on" : ""} onClick={() => fres ? genFecha("vibra") : setMode("vibra")}>Tu año</button>
                <button className={mode === "ambos" ? "on" : ""} onClick={() => fres ? genFecha("ambos") : setMode("ambos")}>Los dos</button>
              </div>

              <div className="sl-actions">
                <button className="sl-primary" onClick={() => genFecha()}>Revelar ✨</button>
                <button className="sl-jade" onClick={() => genFecha(mode, true)}>Revelar y copiar ✨</button>
                {err && <span className="sl-err">{err}</span>}
              </div>

              {fres && (
                  <div className="sl-reveal dawn">
                    <div className="glow" />
                    <div className="rhead">Lo que dice tu fecha</div>
                    <div className="rname">{primerNombre(fNombre) || "Tu energía"}</div>
                    <div className="duo">
                      <div className="card2"><div className="lbl">Camino de Vida</div><div className="big">{fres.camino}</div><div className="cap">el terreno a caminar</div></div>
                      <div className="card2"><div className="lbl">Talento · tu don</div><div className="big">{fres.talento}</div><div className="cap">por dónde brillás</div></div>
                      <div className="card2"><div className="lbl">Vibración · tu año</div><div className="big">{fres.vib}</div><div className="cap">tu energía ahora</div></div>
                    </div>
                    <div className="rfoot">
                      Fecha completa → {fres.caminoTotal} → Camino {fres.camino}<br />
                      Día {fres.dd} → Talento {fres.talento}<br />
                      Último cumple {fres.dd}/{MESES[fres.mm]}/{fres.anioCumple} → Vibración {fres.vib}
                      {fres.karmico && (
                          <><br /><b style={{ color: "#ffd88c" }}>Número kármico {fres.karmico} — solo para vos: no lo detalles en el mensaje gratuito.</b></>
                      )}
                    </div>
                  </div>
              )}
            </div>
        )}

        {msg && (
            <div className="sl-panel">
              <div className="sl-msglbl"><span>Mensaje para el DM</span><span className="cnt">{msg.length} caracteres</span></div>
              <textarea ref={taRef} readOnly value={msg} onFocus={(e) => e.currentTarget.select()} />
              <div className="sl-actions">
                <button className="sl-jade" onClick={copy}>Copiar mensaje</button>
                <button className="sl-ghost" onClick={regen}>Otra versión</button>
                {toast && <span className={"sl-toast" + (toastOk ? "" : " bad")}>{toast}</span>}
              </div>
            </div>
        )}

        <div className="sl-panel">
          <div className="sl-leadhead"><h3>Leads de hoy</h3><button className="sl-ghost" onClick={copyLeads}>Copiar lista</button></div>
          {leads.length === 0 ? <div className="sl-empty">Todavía no generaste ninguno.</div> :
              leads.map((l) => (
                  <div key={l.cid} className="sl-lead"><div className="lchip">{l.chip}</div>
                    <div className="lnm">{l.nm}<small>{l.u || "sin @"} · {l.k}</small></div>
                    <span className={"lsave " + l.saved}>{l.saved === "ok" ? "guardado ✓" : l.saved === "no" ? "sin guardar" : "guardando…"}</span>
                  </div>
              ))}
        </div>

        <footer className="sl-foot">El envío se hace a mano desde tu DM · interpretación fiel al curso · el mensaje cambia solo · <b>€0</b></footer>
      </div>
  );
}

const CSS = `
.sl{--amatista:#5B4A9E;--lila:#8A76C9;--jade:#4FA98A;--lavanda:#D9CFF0;--crema:#F5F2EC;--noche:#2E2645;--tinta:#3a3350;--linea:rgba(91,74,158,.16);
  font-family:'Nunito Sans',system-ui,sans-serif;color:var(--tinta);max-width:660px;margin:0 auto;padding:24px 16px 48px;-webkit-font-smoothing:antialiased}
.sl *{box-sizing:border-box}
.sl-head{display:flex;align-items:center;gap:12px}
.sl-moon{width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 32% 30%,var(--lavanda),var(--lila) 60%,var(--amatista));box-shadow:0 0 0 6px rgba(138,118,201,.14)}
.sl-brand{font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:1.4rem;letter-spacing:.14em;color:var(--amatista)}
.sl-brand b{font-weight:600}
.sl-eyebrow{font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;color:var(--lila);margin:20px 0 4px;font-weight:700}
.sl-h1{font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:1.85rem;line-height:1.15;margin:0 0 18px;color:var(--noche)}
.sl-tabs{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.sl-tab{font-family:'Nunito Sans',sans-serif;font-weight:700;font-size:.9rem;cursor:pointer;border:1.5px solid var(--linea);background:#fff;color:var(--amatista);padding:10px 16px;border-radius:12px;transition:all .15s}
.sl-tab.on{background:var(--amatista);color:#fff;border-color:var(--amatista)}
.sl-panel{background:#fff;border:1px solid var(--linea);border-radius:18px;padding:18px;margin-bottom:18px;box-shadow:0 10px 30px -22px rgba(46,38,69,.5)}
.sl-sub{font-size:.9rem;color:#6b6480;margin:0 0 14px}
.sl label{display:block;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--lila);font-weight:700;margin:0 0 6px}
.sl input,.sl textarea,.sl select{width:100%;font-family:'Nunito Sans',sans-serif;font-size:1rem;padding:11px 13px;border:1.5px solid var(--linea);border-radius:12px;color:var(--noche);background:#fdfcff}
.sl select{cursor:pointer}
.sl input:focus,.sl textarea:focus,.sl select:focus{outline:none;border-color:var(--lila);box-shadow:0 0 0 4px rgba(138,118,201,.15)}
.sl-row{display:flex;gap:10px;flex-wrap:wrap}
.sl-row .grow{flex:1 1 190px;min-width:0}.sl-row .short{flex:1 1 110px;min-width:0}
.sl input,.sl select{min-width:0}
.sl-seg{display:flex;gap:6px;margin-top:14px;background:#f4f0fb;padding:5px;border-radius:12px;width:fit-content}
.sl-seg button{font-family:'Nunito Sans',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;border:none;background:transparent;color:var(--amatista);padding:7px 14px;border-radius:9px}
.sl-seg button.on{background:#fff;color:var(--noche);box-shadow:0 2px 8px -3px rgba(46,38,69,.35)}
.sl-actions{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.sl button.sl-primary{background:var(--amatista);color:#fff;font-weight:700;font-size:1rem;padding:12px 22px;border:none;border-radius:12px;cursor:pointer}
.sl button.sl-jade{background:var(--jade);color:#fff;font-weight:700;font-size:.95rem;padding:11px 18px;border:none;border-radius:12px;cursor:pointer}
.sl button.sl-ghost{background:transparent;color:var(--amatista);border:1.5px solid var(--linea);font-weight:700;font-size:.88rem;padding:10px 16px;border-radius:12px;cursor:pointer}
.sl-err{font-size:.82rem;color:#c0553f}
.sl-toast{font-size:.85rem;color:var(--jade);font-weight:700}
.sl-toast.bad{color:#c0553f}
.sl-reveal{position:relative;overflow:hidden;border-radius:16px;margin-top:16px;padding:22px;color:#f3effb}
.sl-reveal.night{background:radial-gradient(120% 120% at 20% 0%,#4a3d7d,#2e2645 55%,#241d38)}
.sl-reveal.dawn{background:radial-gradient(130% 130% at 82% 0%,#7c5fb0,#5b4a9e 45%,#3a2f63)}
.sl-reveal .stars{position:absolute;inset:0;opacity:.8;pointer-events:none;background-image:radial-gradient(1.5px 1.5px at 18% 30%,rgba(255,255,255,.7),transparent),radial-gradient(1.5px 1.5px at 72% 22%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 44% 62%,rgba(255,255,255,.5),transparent),radial-gradient(1.5px 1.5px at 88% 68%,rgba(255,255,255,.5),transparent)}
.sl-reveal .glow{position:absolute;top:-40px;right:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,216,140,.5),transparent 65%);pointer-events:none}
.sl-reveal .rhead{position:relative;font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;color:var(--lavanda);font-weight:700}
.sl-reveal .rname{position:relative;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:#eae3fb;margin-top:2px}
.sl-reveal .rnum{position:relative;font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:5.5rem;line-height:.95;margin:4px 0;background:linear-gradient(180deg,#fff,#c9b8ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.sl-reveal .rnum small{-webkit-text-fill-color:var(--lavanda);color:var(--lavanda);font-family:'Nunito Sans',sans-serif;font-weight:600;font-size:.95rem;letter-spacing:.18em;display:block}
.sl-reveal .chips{position:relative;display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.sl-reveal .chip{font-size:.8rem;padding:4px 10px;border-radius:18px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#efeafc}
.sl-reveal .chip b{color:#fff;margin-left:4px}
.sl-reveal .duo{position:relative;display:flex;gap:12px;margin-top:10px;flex-wrap:wrap}
.sl-reveal .card2{flex:1 1 150px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:13px;padding:13px 15px}
.sl-reveal .card2 .lbl{font-size:.64rem;letter-spacing:.2em;text-transform:uppercase;color:var(--lavanda);font-weight:700}
.sl-reveal .card2 .big{font-family:'Josefin Sans',sans-serif;font-weight:200;font-size:3.4rem;line-height:1;background:linear-gradient(180deg,#fff,#e7d9ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.sl-reveal .card2 .cap{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.95rem;color:#e9e2fb}
.sl-reveal .rfoot{position:relative;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.98rem;color:var(--lavanda);margin-top:12px;line-height:1.5}
.sl-msglbl{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.sl-msglbl span{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--lila);font-weight:700}
.sl-msglbl .cnt{font-size:.72rem;color:#a49dbb;letter-spacing:normal;text-transform:none;font-weight:400}
.sl textarea{min-height:210px;line-height:1.5;background:linear-gradient(180deg,#fbf9ff,#f6f2fb);resize:vertical}
.sl-leadhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.sl-leadhead h3{font-family:'Josefin Sans',sans-serif;font-weight:300;font-size:1.1rem;color:var(--noche);margin:0}
.sl-lead{display:flex;align-items:center;gap:10px;padding:8px 2px;border-bottom:1px solid var(--linea);font-size:.9rem}
.sl-lead:last-child{border-bottom:none}
.sl-lead .lchip{min-width:48px;height:28px;border-radius:14px;display:grid;place-items:center;font-family:'Josefin Sans',sans-serif;color:#fff;background:var(--lila);font-size:.78rem;padding:0 8px}
.sl-lead .lnm{flex:1}.sl-lead .lnm small{color:#9a93ac;display:block;font-size:.76rem}
.sl-lead .lsave{font-size:.72rem;font-weight:700;white-space:nowrap}
.sl-lead .lsave.ok{color:var(--jade)}
.sl-lead .lsave.no{color:#b9b2c8}
.sl-lead .lsave.pendiente{color:#c9a24f}
.sl-empty{font-size:.88rem;color:#a49dbb;font-style:italic;padding:4px 2px}
.sl-foot{text-align:center;font-size:.76rem;color:#a49dbb;margin-top:22px}
.sl-foot b{color:var(--lila)}
@media(max-width:480px){.sl-h1{font-size:1.6rem}.sl-reveal .rnum{font-size:4.5rem}.sl-reveal .card2 .big{font-size:2.9rem}
.sl-row{flex-direction:column}.sl-row .grow,.sl-row .short{flex:1 1 auto;width:100%}
.sl-actions{flex-direction:column;align-items:stretch}.sl-actions button{width:100%}}
`;