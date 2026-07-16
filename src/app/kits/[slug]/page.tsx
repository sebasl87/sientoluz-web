import Link from "next/link";
import { notFound } from "next/navigation";
import Precio from "@/components/Precio";
import { precio } from "@/lib/formato";
import { listarKits, traerKit } from "@/lib/catalogo";

export const revalidate = 300;

export async function generateStaticParams() {
  const kits = await listarKits();
  return kits.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = await traerKit(slug);
  if (!kit) return {};
  return { title: kit.nombre, description: kit.bajada };
}

export default async function FichaKit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = await traerKit(slug);
  if (!kit) notFound();

  const suelto = kit.cursos.reduce((t, c) => t + c.precio_ars, 0);
  const ahorro = suelto - kit.precio_ars;

  return (
    <article className="mx-auto max-w-6xl px-5 py-16">
      <Link
        href="/cursos#kits"
        className="font-titulo text-[0.65rem] tracking-[0.2em] uppercase text-lila hover:text-amatista"
      >
        ← Todos los kits
      </Link>

      <div className="mt-6 grid gap-12 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow">{kit.cursos.length} talleres</p>
          <h1 className="mt-3 text-3xl leading-tight">{kit.nombre}</h1>
          <p className="ritual mt-4">{kit.bajada}</p>
          <p className="mt-6 leading-relaxed text-noche/80">{kit.descripcion}</p>

          <h2 className="mt-12 text-lg">Qué incluye</h2>
          <div className="mt-4 divide-y divide-lavanda border-y border-lavanda">
            {kit.cursos.map((c) => (
              <Link
                key={c.slug}
                href={`/cursos/${c.slug}`}
                className="group flex items-baseline justify-between gap-4 py-4"
              >
                <div>
                  <h3 className="text-sm normal-case tracking-normal text-noche group-hover:text-amatista">
                    {c.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-noche/60">{c.bajada}</p>
                </div>
                <span className="shrink-0 text-xs text-noche/45 line-through">
                  {precio(c.precio_ars)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-sm border border-lila/50 bg-lavanda/25 p-6">
            <Precio ars={kit.precio_ars} ancla={kit.precio_ancla_ars} grande />
            <p className="mt-3 text-xs text-noche/70">
              Por separado salen {precio(suelto)}. Ahorrás {precio(ahorro)}.
            </p>
            <Link
              href={`/checkout?kit=${kit.slug}`}
              className="mt-6 block rounded-sm bg-jade px-6 py-3.5 text-center font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover"
            >
              Comprar el kit
            </Link>
            <ul className="mt-6 space-y-2 text-xs leading-relaxed text-noche/70">
              <li>· {kit.cursos.length} PDFs, acceso de por vida</li>
              <li>· Un certificado por taller</li>
              <li>· Mercado Pago o transferencia bancaria</li>
            </ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
