import { NextResponse } from "next/server";
import { cerrarSesion } from "@/lib/admin-sesion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await cerrarSesion();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  return NextResponse.redirect(`${base}/admin/entrar`, { status: 303 });
}
