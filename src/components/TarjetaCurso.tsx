import Link from "next/link";
import Precio from "./Precio";
import type { Curso } from "@/lib/tipos";

export default function TarjetaCurso({ curso }: { curso: Curso }) {
  return (
    <Link
      href={`/cursos/${curso.slug}`}
      className="group flex flex-col justify-between rounded-sm border border-lavanda bg-white/40 p-6 transition-colors hover:border-lila"
    >
      <div>
        <h3 className="text-base leading-snug">{curso.nombre}</h3>
        <p className="mt-3 text-sm leading-relaxed text-noche/70">{curso.bajada}</p>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <Precio ars={curso.precio_ars} ancla={curso.precio_ancla_ars} />
        <span className="font-titulo text-[0.65rem] tracking-[0.2em] uppercase text-lila transition-transform group-hover:translate-x-0.5">
          Ver →
        </span>
      </div>
    </Link>
  );
}
