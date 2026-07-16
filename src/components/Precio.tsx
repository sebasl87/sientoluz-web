import { precio, descuento } from "@/lib/formato";

/** El jade se reserva para lo accionable: precios y botones. */
export default function Precio({
  ars,
  ancla,
  grande = false,
}: {
  ars: number;
  ancla?: number | null;
  grande?: boolean;
}) {
  const off = descuento(ars, ancla ?? null);
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span
        className={`font-titulo tracking-wide text-jade ${grande ? "text-4xl" : "text-2xl"}`}
      >
        {precio(ars)}
      </span>
      {ancla && (
        <span className="text-sm text-noche/45 line-through">{precio(ancla)}</span>
      )}
      {off && (
        <span className="rounded-full bg-lavanda px-2.5 py-0.5 text-xs font-semibold text-amatista">
          {off}% OFF
        </span>
      )}
    </div>
  );
}
