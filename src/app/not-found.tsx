import Link from "next/link";
import Espiral from "@/components/Espiral";

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-lg px-5 py-28 text-center">
      <Espiral className="mx-auto w-24 opacity-45" />
      <h1 className="mt-10 text-2xl">Esta página no existe</h1>
      <p className="mt-4 leading-relaxed text-noche/70">
        Puede que el link esté viejo o que el taller ya no esté publicado. En el
        catálogo está todo lo que hay hoy.
      </p>
      <Link
        href="/cursos"
        className="mt-8 inline-block rounded-sm bg-jade px-7 py-3 font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}
