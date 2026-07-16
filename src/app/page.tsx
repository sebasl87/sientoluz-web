import Link from "next/link";
import Espiral from "@/components/Espiral";
import Separador from "@/components/Separador";
import TarjetaCurso from "@/components/TarjetaCurso";
import TarjetaKit from "@/components/TarjetaKit";
import { listarCursos, listarKits } from "@/lib/catalogo";

export const revalidate = 300;

export default async function Home() {
  const [cursos, kits] = await Promise.all([listarCursos(), listarKits()]);
  const destacados = cursos.filter((c) => c.destacado && !c.solo_en_kit);
  const packs = kits.filter((k) => k.destacado);

  return (
    <>
      {/* Hero: la espiral se dibuja y el punto jade escapa. Es la tesis de la marca. */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-16 pb-20 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
        <div>
          <p className="eyebrow">Talleres para descargar</p>
          <h1 className="mt-4 text-3xl leading-[1.25] sm:text-4xl md:text-[2.75rem]">
            De lo denso
            <br />
            a lo sutil
          </h1>
          <p className="ritual mt-6 max-w-md">
            Todo lo que trabajás adentro, tarde o temprano sale a compartirse.
          </p>
          <p className="mt-6 max-w-md leading-relaxed text-noche/75">
            Numerología, péndulo, limpieza energética, chakras y meditación. Talleres
            en PDF, escritos para practicar desde el primer día, con diarios de
            seguimiento y certificado al terminar.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/cursos"
              className="rounded-sm bg-jade px-7 py-3 font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover"
            >
              Ver los cursos
            </Link>
            <Link
              href="/cursos#kits"
              className="font-titulo text-xs tracking-[0.2em] uppercase text-amatista underline-offset-4 hover:underline"
            >
              O llevá un kit completo
            </Link>
          </div>
        </div>
        <Espiral animada className="mx-auto w-56 md:w-full md:max-w-xs" />
      </section>

      <Separador className="mx-auto max-w-6xl px-5" />

      {/* Cursos destacados */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">Por dónde empezar</p>
        <h2 className="mt-3 text-2xl">Cursos destacados</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((c) => (
            <TarjetaCurso key={c.slug} curso={c} />
          ))}
        </div>
        <Link
          href="/cursos"
          className="mt-8 inline-block font-titulo text-xs tracking-[0.2em] uppercase text-amatista underline-offset-4 hover:underline"
        >
          Ver el catálogo completo →
        </Link>
      </section>

      {/* Cómo funciona: es una secuencia real, por eso va numerado */}
      <section className="bg-lavanda/30 px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl">Cómo funciona</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              ["Elegís", "Un taller suelto o un kit. Pagás con Mercado Pago o por transferencia."],
              ["Recibís", "El PDF te llega al mail en minutos, con tu nombre en cada página."],
              ["Practicás", "Cada taller trae ejercicios y diario. Al terminar, pedís tu certificado."],
            ].map(([titulo, texto], i) => (
              <li key={titulo}>
                <span className="font-titulo text-3xl font-light text-lila">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-base">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-noche/70">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Kits */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">Conviene más</p>
        <h2 className="mt-3 text-2xl">Kits</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-noche/70">
          Los talleres se potencian entre sí: el péndulo mide chakras, la limpieza
          áurica se sostiene con la de ambientes. Por eso los agrupamos.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {packs.map((k) => (
            <TarjetaKit key={k.slug} kit={k} />
          ))}
        </div>
      </section>
    </>
  );
}
