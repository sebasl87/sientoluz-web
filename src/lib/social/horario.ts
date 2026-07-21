/**
 * Conversión ART ⇄ UTC para los posts programados.
 *
 * Argentina es UTC-3 fijo, todo el año (no tiene horario de verano desde
 * 2009), así que no hace falta ninguna librería de timezones: es aritmética
 * simple sobre los componentes de la fecha. Guardamos siempre UTC en la
 * base; esto es solo para la conversión de ida y vuelta con el <input>.
 */

const OFFSET_HORAS = 3;

/** "AAAA-MM-DDTHH:mm" (hora ART, como la escribe el input) → ISO UTC. */
export function artAUtcIso(valorLocal: string): string {
  const [fecha, hora] = valorLocal.split("T");
  const [y, m, d] = fecha.split("-").map(Number);
  const [h, min] = (hora ?? "00:00").split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h + OFFSET_HORAS, min)).toISOString();
}

/** ISO UTC → "AAAA-MM-DDTHH:mm" en ART, para precargar el <input>. */
export function utcIsoAArtLocal(iso: string): string {
  const ms = new Date(iso).getTime() - OFFSET_HORAS * 3600_000;
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(
    d.getUTCHours()
  )}:${p(d.getUTCMinutes())}`;
}

/**
 * "HH:mm" de cada corrida del cron (cada 15 min, dentro de 08–11 y 15–20
 * ART). Se usa para que el selector de horario del admin solo ofrezca
 * horarios en los que el post realmente va a salir.
 */
export function horariosDeCron(): string[] {
  const horas = [8, 9, 10, 11, 15, 16, 17, 18, 19, 20];
  const minutos = [0, 15, 30, 45];
  const p = (n: number) => String(n).padStart(2, "0");
  return horas.flatMap((h) => minutos.map((m) => `${p(h)}:${p(m)}`));
}

export function formatoArt(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
