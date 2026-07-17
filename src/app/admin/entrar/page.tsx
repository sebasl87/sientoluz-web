import Espiral from "@/components/Espiral";
import FormularioEntrar from "./FormularioEntrar";

export const dynamic = "force-dynamic";

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6">
      <Espiral className="mb-8 w-20" />
      <h1 className="mb-1 font-titulo text-xl">Panel</h1>
      <p className="mb-8 text-sm text-noche/60">Te mando un link a tu mail.</p>
      {error && (
        <p className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          El link venció o no es válido. Pedí uno nuevo.
        </p>
      )}
      <FormularioEntrar />
    </main>
  );
}
