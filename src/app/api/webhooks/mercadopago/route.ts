import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { entregar } from "@/lib/entregar";
import { supabaseServidor } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mercado Pago avisa acá cuando cambia un pago.
 * 1. Valida la firma (x-signature) para descartar avisos falsos.
 * 2. Consulta el pago real a la API de MP (nunca confía en el body).
 * 3. Si está aprobado, marca la orden pagada y ejecuta la entrega completa.
 */
function firmaValida(req: Request, dataId: string) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) return true; // en desarrollo, sin secreto configurado

  const firma = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!firma || !requestId) return false;

  const partes = Object.fromEntries(
    firma.split(",").map((p) => p.split("=").map((s) => s.trim()) as [string, string])
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  const manifiesto = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const esperada = crypto.createHmac("sha256", secreto).update(manifiesto).digest("hex");

  const a = Buffer.from(esperada);
  const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    data?: { id?: string };
  };

  const dataId = body.data?.id ?? url.searchParams.get("data.id") ?? "";
  const tipo = body.type ?? url.searchParams.get("type");

  if (tipo !== "payment" || !dataId) {
    return NextResponse.json({ ok: true, ignorado: true });
  }
  if (!firmaValida(req, dataId)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  // La verdad la tiene la API de MP, no el webhook.
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });
  if (!res.ok) return NextResponse.json({ error: "No se pudo leer el pago" }, { status: 502 });

  const pago = (await res.json()) as {
    status: string;
    external_reference: string;
    id: number;
  };

  if (pago.status !== "approved") {
    return NextResponse.json({ ok: true, estado: pago.status });
  }

  const db = supabaseServidor();
  const { data: orden } = await db
    .from("ordenes")
    .select("id, numero, estado")
    .eq("numero", pago.external_reference)
    .maybeSingle();

  if (!orden) return NextResponse.json({ error: "Orden inexistente" }, { status: 404 });
  if (orden.estado !== "pendiente") return NextResponse.json({ ok: true, duplicado: true });

  await db
    .from("ordenes")
    .update({ estado: "pagado", mp_payment_id: String(pago.id), pagado_en: new Date().toISOString() })
    .eq("id", orden.id);

  // La entrega corre acá mismo: estampa los PDFs, genera certificados,
  // sube todo, firma links y manda el mail. Si falla, la orden ya quedó
  // en 'pagado' y el /admin la muestra con el botón Reintentar — el
  // cliente nunca pierde la compra, a lo sumo espera unos minutos.
  try {
    await entregar(orden.id);
  } catch (err) {
    console.error(`[webhook MP] orden ${orden.numero}: pago ok, entrega falló:`, err);
  }

  return NextResponse.json({ ok: true });
}
