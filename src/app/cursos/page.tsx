import Separador from "@/components/Separador";
import TarjetaCurso from "@/components/TarjetaCurso";
import TarjetaKit from "@/components/TarjetaKit";
import { listarCursos, listarKits } from "@/lib/catalogo";

export const revalidate = 300;
export const metadata = { title: "Cursos" };

export default async function Cursos() {
  const [cursos, kits] = await Promise.all([listarCursos(), listarKits()]);
  const sueltos = cursos.filter((c) => !c.solo_en_kit);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <p className="eyebrow">Catálogo</p>
      <h1 className="mt-3 text-3xl">Talleres</h1>
      <p className="mt-4 max-w-lg leading-relaxed text-noche/75">
        Cada taller es un PDF completo, para leer y practicar a tu ritmo, sin fecha de
        vencimiento. Descarga inmediata después de acreditado el pago.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sueltos.map((c) => (
          <TarjetaCurso key={c.slug} curso={c} />
        ))}
      </div>

      <Separador className="my-20" />

      <section id="kits" className="scroll-mt-24">
        <p className="eyebrow">Conviene más</p>
        <h2 className="mt-3 text-2xl">Kits</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {kits.map((k) => (
            <TarjetaKit key={k.slug} kit={k} />
          ))}
        </div>
      </section>
    </div>
  );
}
