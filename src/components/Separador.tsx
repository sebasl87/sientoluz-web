/**
 * Separador de secciones del sistema geométrico arcturiano.
 * Línea fina, nunca relleno. Máximo un elemento geométrico por pieza.
 */
export default function Separador({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-lavanda" />
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2 L19 11 L11 20 L3 11 Z"
          stroke="var(--color-lila)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <circle cx="11" cy="11" r="2" stroke="var(--color-lila)" strokeWidth="1" />
      </svg>
      <span className="h-px flex-1 bg-lavanda" />
    </div>
  );
}
