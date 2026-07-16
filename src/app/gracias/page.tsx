import Link from "next/link";
import Espiral from "@/components/Espiral";

export const metadata = { title: "Gracias" };

export default async function Gracias({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string; status?: string }>;
}) {
  const { orden, status } = await searchParams;
  const pendiente = status === "pending" || status === "in_process";

  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <Espiral animada className="mx-auto w-32" />
      <h1 className="mt-10 text-3xl">{pendiente ? "Pago en proceso" : "Gracias"}</h1>

      {pendiente ? (
        <p className="mt-5 leading-relaxed text-noche/75">
          Mercado Pago todavía está confirmando el pago. Apenas se acredite —suele ser
          cuestión de minutos— te llega el material al mail.
        </p>
      ) : (
        <>
          <p className="ritual mt-5">Tu luz ya salió a buscarte.</p>
          <p className="mt-5 leading-relaxed text-noche/75">
            Revisá tu correo: el material te llega en minutos, con tu nombre en cada
            página. Si no lo ves, mirá en spam o en la pestaña de promociones.
          </p>
        </>
      )}

      {orden && (
        <p className="mt-8 font-titulo text-xs tracking-[0.2em] uppercase text-noche/50">
          Orden {orden}
        </p>
      )}

      <Link
        href="/cursos"
        className="mt-10 inline-block rounded-sm bg-jade px-7 py-3 font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover"
      >
        Seguir explorando
      </Link>
    </div>
  );
}
