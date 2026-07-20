import Link from "next/link";
import { redirect } from "next/navigation";
import { sesion } from "@/lib/admin-sesion";
import GanchosSientoLuz from "./GanchosSientoLuz";

export const dynamic = "force-dynamic";

export default async function PageGanchosAdmin() {
  if (!(await sesion())) redirect("/admin/entrar");

  return (
    <main className="min-h-dvh px-4 py-8">
      <div className="mx-auto mb-4 flex w-full max-w-165 items-center justify-between gap-3">
        <Link
          href="/admin"
          className="text-sm text-amatista underline underline-offset-2"
        >
          Volver al panel
        </Link>
        <form action="/api/admin/salir" method="post">
          <button className="text-sm text-noche/50 underline underline-offset-2">
            Salir
          </button>
        </form>
      </div>

      <GanchosSientoLuz />
    </main>
  );
}
