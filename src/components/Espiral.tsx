type Props = {
  /** Dibuja la espiral al montar. Solo en el hero: una vez por visita. */
  animada?: boolean;
  className?: string;
  /** "amatista" para fondos claros (por defecto), "crema" para fondos oscuros (noche). */
  variante?: "amatista" | "crema";
  /**
   * Grosor del trazo en unidades del viewBox (200×200). El valor por
   * defecto (1.5) se ve fino y elegante a tamaño hero, pero a tamaños
   * chicos (ej. el header, ~36px) queda sub-pixel y se ve borroso/pixelado.
   * Subilo cuando el símbolo se muestre pequeño.
   */
  grosor?: number;
};

/**
 * El símbolo de la marca: una espiral que crece desde el centro lila,
 * contenida en un círculo que se abre, y un punto jade que escapa por
 * la abertura. Es la historia de SientoLuz dibujada en una línea.
 */
export default function Espiral({ animada = false, className, variante = "amatista", grosor = 1.5 }: Props) {
  const trazo = variante === "crema" ? "var(--color-crema)" : "var(--color-amatista)";

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" role="presentation">
      {/* círculo contenedor, abierto entre -20° y -60° */}
      <path
        d="M173.3 73.32 A78 78 0 1 1 139 32.45"
        fill="none"
        stroke={trazo}
        strokeWidth={grosor}
        strokeLinecap="round"
        style={
          animada
            ? { ["--largo" as string]: 436, strokeDasharray: 436, animation: "trazar 1.6s ease-out both" }
            : undefined
        }
      />
      {/* espiral */}
      <path
        d="M100.0 100.0L100.1 99.5L100.2 99.1L100.5 98.6L100.8 98.3L101.2 98.0L101.7 97.7L102.3 97.6L102.9 97.5L103.6 97.6L104.2 97.8L104.9 98.1L105.5 98.5L106.1 99.0L106.7 99.7L107.1 100.4L107.5 101.3L107.8 102.2L108.0 103.2L108.0 104.3L107.8 105.4L107.6 106.6L107.1 107.7L106.6 108.8L105.8 109.9L104.9 110.9L103.8 111.8L102.6 112.6L101.3 113.3L99.8 113.8L98.3 114.2L96.6 114.4L94.9 114.4L93.2 114.2L91.4 113.8L89.7 113.1L88.0 112.3L86.4 111.2L84.8 109.9L83.4 108.4L82.2 106.8L81.1 104.9L80.2 102.9L79.5 100.7L79.1 98.5L78.9 96.1L79.0 93.7L79.3 91.3L80.0 88.9L80.9 86.5L82.2 84.2L83.7 82.0L85.4 79.9L87.4 78.1L89.7 76.4L92.2 75.0L94.9 73.8L97.7 72.9L100.7 72.3L103.7 72.1L106.8 72.2L110.0 72.7L113.1 73.5L116.2 74.7L119.1 76.2L121.9 78.1L124.5 80.3L126.9 82.8L129.1 85.6L130.9 88.7L132.4 92.0L133.6 95.5L134.3 99.2L134.7 102.9L134.6 106.8L134.1 110.6L133.2 114.5L131.9 118.2L130.1 121.9L127.9 125.3L125.3 128.6L122.3 131.5L119.0 134.2L115.4 136.5L111.5 138.4L107.3 139.9L103.0 140.9L98.5 141.5L93.9 141.5L89.3 141.1L84.8 140.1L80.3 138.7L76.0 136.7L71.8 134.2L67.9 131.3L64.3 127.9L61.1 124.2L58.3 120.0L55.9 115.5L54.0 110.7L52.7 105.7L51.8 100.6L51.6 95.3L51.9 90.0L52.8 84.7L54.3 79.4L56.4 74.4L59.1 69.5L62.3 64.9L66.0 60.7L70.2 56.8L74.8 53.4L79.9 50.5L85.2 48.2L90.8 46.4L96.7 45.3L102.7 44.7L108.7 44.9L114.8 45.7L120.8 47.2L126.6 49.3L132.2 52.1L137.5 55.5L142.5 59.5L147.0 64.1L151.0 69.2L154.5 74.7L157.4 80.6L159.6 86.8L161.2 93.3L162.0 100.0"
        fill="none"
        stroke={trazo}
        strokeWidth={grosor}
        strokeLinecap="round"
        style={
          animada
            ? {
                ["--largo" as string]: 460,
                strokeDasharray: 460,
                animation: "trazar 1.8s 0.3s ease-out both",
              }
            : undefined
        }
      />
      {/* corazón lila: el interior de cada persona */}
      <circle cx="100" cy="100" r="4" fill="var(--color-lila)" />
      {/* punto jade: la luz que sale a compartirse */}
      <circle
        cx="159.75"
        cy="49.86"
        r="5"
        fill="var(--color-jade)"
        style={animada ? { animation: "escapar 1.4s 1.9s ease-out both" } : undefined}
      />
    </svg>
  );
}
