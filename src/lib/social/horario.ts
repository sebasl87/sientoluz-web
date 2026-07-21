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

/** Las franjas en que corre el cron: 08–11 y 15–20 ART. */
export function enFranjaDeCron(valorLocal: string): boolean {
  const hora = Number(valorLocal.split("T")[1]?.split(":")[0] ?? "-1");
  return (hora >= 8 && hora < 12) || (hora >= 15 && hora < 21);
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
