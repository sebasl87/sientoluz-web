import { NextResponse } from "next/server";
import { verificarTokenLink, abrirSesion } from "@/lib/admin-sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** El link del mail cae acá: valida el token y deja la cookie de sesión. */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") ?? undefined;
  const email = verificarTokenLink(t);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  if (!email) {
    return NextResponse.redirect(`${base}/admin/entrar?error=1`);
  }
  await abrirSesion(email);
  return NextResponse.redirect(`${base}/admin`);
}
