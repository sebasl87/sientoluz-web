import Link from "next/link";
import Precio from "./Precio";
import type { Kit } from "@/lib/tipos";

export default function TarjetaKit({ kit }: { kit: Kit }) {
  const suelto = kit.cursos.reduce((t, c) => t + c.precio_ars, 0);
  return (
    <Link
      href={`/kits/${kit.slug}`}
      className="group flex flex-col justify-between rounded-sm border border-lila/50 bg-lavanda/25 p-6 transition-colors hover:border-lila"
    >
      <div>
        <p className="eyebrow">{kit.cursos.length} talleres</p>
        <h3 className="mt-2 text-base leading-snug">{kit.nombre}</h3>
        <p className="mt-3 text-sm leading-relaxed text-noche/70">{kit.bajada}</p>
        <ul className="mt-4 space-y-1 text-xs text-noche/60">
          {kit.cursos.map((c) => (
            <li key={c.slug}>· {c.nombre}</li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <Precio ars={kit.precio_ars} ancla={kit.precio_ancla_ars} />
        <p className="mt-2 text-xs text-noche/55">
          Comprados por separado: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(suelto)}
        </p>
      </div>
    </Link>
  );
}
