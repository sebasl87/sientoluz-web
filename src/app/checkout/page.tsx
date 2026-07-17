import { notFound } from "next/navigation";
import FormularioCompra from "./FormularioCompra";
import Precio from "@/components/Precio";
import { traerCurso, traerKit } from "@/lib/catalogo";

export const metadata = { title: "Comprar" };

type Params = Promise<{ curso?: string; kit?: string }>;

export default async function Checkout({ searchParams }: { searchParams: Params }) {
  const { curso: slugCurso, kit: slugKit } = await searchParams;

  const item = slugKit
    ? await traerKit(slugKit).then((k) =>
        k ? { tipo: "kit" as const, slug: k.slug, nombre: k.nombre, precio: k.precio_ars, ancla: k.precio_ancla_ars, detalle: k.cursos.map((c) => c.nombre) } : null
      )
    : slugCurso
      ? await traerCurso(slugCurso).then((c) =>
          c && !c.solo_en_kit
            ? { tipo: "curso" as const, slug: c.slug, nombre: c.nombre, precio: c.precio_ars, ancla: c.precio_ancla_ars, detalle: [] }
            : null
        )
      : null;

  if (!item) notFound();

  const mpDisponible = Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <p className="eyebrow">Último paso</p>
      <h1 className="mt-3 text-3xl">Tu compra</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_0.8fr]">
        <FormularioCompra tipo={item.tipo} slug={item.slug} mpDisponible={mpDisponible} />

        <aside className="order-first rounded-sm border border-lavanda bg-white/40 p-6 md:order-last md:sticky md:top-24 md:self-start">
          <h2 className="text-sm">{item.nombre}</h2>
          {item.detalle.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-noche/60">
              {item.detalle.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          )}
          <div className="mt-5 border-t border-lavanda pt-5">
            <Precio ars={item.precio} ancla={item.ancla} grande />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-noche/60">
            Después de acreditado el pago te llega el material al mail, con tu nombre
            en cada página.
          </p>
        </aside>
      </div>
    </div>
  );
}
