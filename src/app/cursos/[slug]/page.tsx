import Link from "next/link";
import { notFound } from "next/navigation";
import Precio from "@/components/Precio";
import Separador from "@/components/Separador";
import TarjetaKit from "@/components/TarjetaKit";
import { listarCursos, traerCurso, kitsQueIncluyen } from "@/lib/catalogo";

export const revalidate = 300;

export async function generateStaticParams() {
  const cursos = await listarCursos();
  return cursos.filter((c) => !c.solo_en_kit).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso = await traerCurso(slug);
  if (!curso) return {};
  return { title: curso.nombre, description: curso.bajada };
}

export default async function FichaCurso({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curso = await traerCurso(slug);
  if (!curso || curso.solo_en_kit) notFound();

  const kits = await kitsQueIncluyen(slug);

  return (
    <article className="mx-auto max-w-6xl px-5 py-16">
      <Link
        href="/cursos"
        className="font-titulo text-[0.65rem] tracking-[0.2em] uppercase text-lila hover:text-amatista"
      >
        ← Todos los talleres
      </Link>

      <div className="mt-6 grid gap-12 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h1 className="text-3xl leading-tight">{curso.nombre}</h1>
          <p className="ritual mt-4">{curso.bajada}</p>
          <p className="mt-6 leading-relaxed text-noche/80">{curso.descripcion}</p>

          <h2 className="mt-12 text-lg">Qué te llevás</h2>
          <ul className="mt-4 space-y-3">
            {curso.aprendes.map((a) => (
              <li key={a} className="flex gap-3 text-sm leading-relaxed text-noche/80">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-jade" />
                {a}
              </li>
            ))}
          </ul>

          {curso.dirigido_a && (
            <>
              <h2 className="mt-12 text-lg">Para quién es</h2>
              <p className="mt-4 text-sm leading-relaxed text-noche/80">{curso.dirigido_a}</p>
            </>
          )}

          <h2 className="mt-12 text-lg">Contenido</h2>
          <ol className="mt-4 divide-y divide-lavanda border-y border-lavanda">
            {curso.temario.map((t, i) => (
              <li key={t} className="flex gap-4 py-3 text-sm text-noche/80">
                <span className="font-titulo text-xs text-lila">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t}
              </li>
            ))}
          </ol>
        </div>

        {/* Compra */}
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-sm border border-lila/50 bg-lavanda/25 p-6">
            <Precio ars={curso.precio_ars} ancla={curso.precio_ancla_ars} grande />
            <Link
              href={`/checkout?curso=${curso.slug}`}
              className="mt-6 block rounded-sm bg-jade px-6 py-3.5 text-center font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover"
            >
              Comprar el taller
            </Link>
            <ul className="mt-6 space-y-2 text-xs leading-relaxed text-noche/70">
              <li>· PDF descargable, acceso de por vida</li>
              {curso.paginas && <li>· {curso.paginas} páginas</li>}
              <li>· Certificado de participación al terminar</li>
              <li>· Mercado Pago o transferencia bancaria</li>
              <li>· Consultas por WhatsApp mientras lo hacés</li>
            </ul>
          </div>
        </aside>
      </div>

      {kits.length > 0 && (
        <>
          <Separador className="my-20" />
          <section>
            <p className="eyebrow">Conviene más</p>
            <h2 className="mt-3 text-2xl">Este taller también viene en kit</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {kits.map((k) => (
                <TarjetaKit key={k.slug} kit={k} />
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
