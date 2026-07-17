import { NextResponse } from "next/server";
import { sesion } from "@/lib/admin-sesion";
import { supabaseServidor } from "@/lib/supabase";
import { entregar } from "@/lib/entregar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Las tres acciones del panel. Todas exigen sesión: el middleware protege
 * las páginas, pero una ruta de API se puede llamar directo — se verifica acá.
 *
 *  aprobar     pendiente → pagado → entregar()
 *  reintentar  pagado (entrega fallida) → entregar()
 *  rechazar    pendiente → cancelado
 */
export async function POST(req: Request) {
  if (!(await sesion())) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const { accion, ordenId } = (await req.json().catch(() => ({}))) as {
    accion?: string;
    ordenId?: string;
  };
  if (!ordenId) return NextResponse.json({ error: "Falta la orden" }, { status: 400 });

  const db = supabaseServidor();
  const { data: orden } = await db
    .from("ordenes")
    .select("id, numero, estado")
    .eq("id", ordenId)
    .maybeSingle();
  if (!orden) return NextResponse.json({ error: "Orden inexistente" }, { status: 404 });

  try {
    if (accion === "aprobar") {
      if (orden.estado !== "pendiente") {
        return NextResponse.json({ error: `La orden está '${orden.estado}'` }, { status: 409 });
      }
      const { error } = await db
        .from("ordenes")
        .update({ estado: "pagado", pagado_en: new Date().toISOString() })
        .eq("id", orden.id)
        .eq("estado", "pendiente"); // condición: si otro clic ganó, este no pisa
      if (error) throw new Error(error.message);

      const r = await entregar(orden.id);
      return NextResponse.json({ ok: true, mensaje: `Entregado a ${r.email}` });
    }

    if (accion === "reintentar") {
      if (orden.estado !== "pagado") {
        return NextResponse.json({ error: `La orden está '${orden.estado}'` }, { status: 409 });
      }
      const r = await entregar(orden.id);
      return NextResponse.json({
        ok: true,
        mensaje: r.yaEstaba ? "Ya estaba entregada" : `Entregado a ${r.email}`,
      });
    }

    if (accion === "rechazar") {
      if (orden.estado !== "pendiente") {
        return NextResponse.json({ error: `La orden está '${orden.estado}'` }, { status: 409 });
      }
      const { error } = await db
        .from("ordenes")
        .update({ estado: "cancelado" })
        .eq("id", orden.id);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, mensaje: "Orden cancelada" });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (err) {
    // La orden queda como quedó: si aprobaste y falló la entrega, está en
    // 'pagado' y el panel te muestra Reintentar. No se pierde la venta.
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[admin/accion] ${accion} orden ${orden.numero}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
