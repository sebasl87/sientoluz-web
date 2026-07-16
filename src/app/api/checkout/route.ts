import { NextResponse } from "next/server";
import { supabaseServidor } from "@/lib/supabase";

export const runtime = "nodejs";

type Cuerpo = {
  tipo: "curso" | "kit";
  slug: string;
  metodo: "mercadopago" | "transferencia";
  nombre: string;
  email: string;
  telefono?: string;
  acepta_novedades?: boolean;
};

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const cuerpo = (await req.json()) as Cuerpo;
  const nombre = cuerpo.nombre?.trim();
  const email = cuerpo.email?.trim().toLowerCase();

  if (!nombre || nombre.length < 2) {
    return NextResponse.json({ error: "Falta tu nombre y apellido." }, { status: 400 });
  }
  if (!email || !EMAIL_OK.test(email)) {
    return NextResponse.json({ error: "Revisá el email: no parece válido." }, { status: 400 });
  }
  if (!["curso", "kit"].includes(cuerpo.tipo) || !["mercadopago", "transferencia"].includes(cuerpo.metodo)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const db = supabaseServidor();
  const tabla = cuerpo.tipo === "kit" ? "kits" : "cursos";

  // El precio se lee siempre de la base, nunca del cliente.
  const { data } = await db.from(tabla).select("*").eq("slug", cuerpo.slug).maybeSingle();
  const item = data as {
    id: string;
    nombre: string;
    precio_ars: number;
    activo: boolean;
    solo_en_kit?: boolean;
  } | null;

  if (!item || !item.activo || (cuerpo.tipo === "curso" && item.solo_en_kit)) {
    return NextResponse.json({ error: "Ese taller ya no está disponible." }, { status: 404 });
  }

  // Cliente (upsert por email)
  const { data: cliente, error: errCliente } = await db
    .from("clientes")
    .upsert(
      {
        email,
        nombre,
        telefono: cuerpo.telefono?.trim() || null,
        acepta_novedades: !!cuerpo.acepta_novedades,
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (errCliente || !cliente) {
    return NextResponse.json({ error: "No pudimos guardar tus datos. Probá de nuevo." }, { status: 500 });
  }

  // Orden
  const { data: orden, error: errOrden } = await db
    .from("ordenes")
    .insert({
      cliente_id: cliente.id,
      metodo: cuerpo.metodo,
      estado: "pendiente",
      total_ars: item.precio_ars,
    })
    .select("id, numero")
    .single();

  if (errOrden || !orden) {
    return NextResponse.json({ error: "No pudimos crear la orden. Probá de nuevo." }, { status: 500 });
  }

  await db.from("orden_items").insert({
    orden_id: orden.id,
    curso_id: cuerpo.tipo === "curso" ? item.id : null,
    kit_id: cuerpo.tipo === "kit" ? item.id : null,
    nombre: item.nombre,
    precio_ars: item.precio_ars,
  });

  if (cuerpo.metodo === "transferencia") {
    return NextResponse.json({ url: `/transferencia/${orden.numero}` });
  }

  // ── Mercado Pago · Checkout Pro ───────────────────────────
  const sitio = process.env.NEXT_PUBLIC_SITE_URL!;
  const mp = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": orden.id,
    },
    body: JSON.stringify({
      items: [
        {
          id: cuerpo.slug,
          title: item.nombre,
          description: "SientoLuz · taller en PDF",
          quantity: 1,
          currency_id: "ARS",
          unit_price: item.precio_ars,
        },
      ],
      payer: { name: nombre, email },
      external_reference: orden.numero,
      statement_descriptor: "SIENTOLUZ",
      back_urls: {
        success: `${sitio}/gracias?orden=${orden.numero}`,
        pending: `${sitio}/gracias?orden=${orden.numero}`,
        failure: `${sitio}/checkout?${cuerpo.tipo}=${cuerpo.slug}&error=pago`,
      },
      auto_return: "approved",
      notification_url: `${sitio}/api/webhooks/mercadopago`,
    }),
  });

  if (!mp.ok) {
    await db.from("ordenes").update({ estado: "cancelado", notas: "Falló la creación de la preferencia MP" }).eq("id", orden.id);
    return NextResponse.json({ error: "Mercado Pago no respondió. Probá con transferencia o reintentá en un minuto." }, { status: 502 });
  }

  const pref = (await mp.json()) as { id: string; init_point: string };
  await db.from("ordenes").update({ mp_preference_id: pref.id }).eq("id", orden.id);

  return NextResponse.json({ url: pref.init_point });
}
