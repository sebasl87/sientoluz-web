import { NextResponse } from "next/server";
import { Resend } from "resend";
import { crearTokenLink, esAdmin } from "@/lib/admin-sesion";
import { emailMagicLink } from "@/lib/emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pide un link de acceso al panel.
 * Responde siempre igual, sea el mail correcto o no: si dijera "ese mail
 * no es", cualquiera podría descubrir cuál sí es probando.
 */
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const pedido = (email ?? "").trim().toLowerCase();

  if (pedido && esAdmin(pedido)) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/entrar?t=${crearTokenLink(pedido)}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "SientoLuz <hola@sientoluz.com>",
      to: pedido,
      subject: "Tu acceso al panel",
      html: emailMagicLink({ url, minutos: 15 }),
    });
    if (error) console.error("[admin/link] no se pudo enviar:", error.message);
  }

  return NextResponse.json({ ok: true });
}
