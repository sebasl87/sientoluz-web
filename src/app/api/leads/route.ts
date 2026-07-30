// app/api/leads/route.ts
// Endpoint server-side de los leads de /admin/ganchos.
//   POST → inserta un lead nuevo (lo llama GanchosSientoLuz al revelar).
//   GET  → lista leads guardados en un rango de fechas (panel "Leads anteriores").
// Ambos exigen sesión de /admin: la tabla tiene RLS sin políticas, así que
// sin la SERVICE ROLE key nadie externo puede leer ni escribir igual, pero
// sin este guard cualquiera que conociera la URL podía spamear leads falsos.

import { NextResponse } from "next/server";
import { sesion } from "@/lib/admin-sesion";
import { supabaseServidor } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GANCHOS = ["camino", "alma", "talento", "vibra", "ambos"] as const;
const LIMITE_MAX = 500;

export async function POST(req: Request) {
    if (!(await sesion())) {
        return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
    }

    try {
        const b = await req.json();
        const gancho = String(b?.gancho ?? "");
        const numero = String(b?.numero ?? "");
        if (!GANCHOS.includes(gancho as (typeof GANCHOS)[number]) || !numero) {
            return NextResponse.json({ error: "datos inválidos" }, { status: 400 });
        }

        const db = supabaseServidor();
        const { error } = await db.from("leads_ganchos").insert({
            gancho,
            numero,
            nombre: b?.nombre?.trim() || null,
            usuario: b?.usuario?.trim() || null,
            canal: b?.canal || null,
            fecha_nac: b?.fecha_nac || null,
        });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "body inválido" }, { status: 400 });
    }
}

// Argentina no tiene horario de verano: el offset a UTC es siempre -03:00.
const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /api/leads?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
 * Devuelve los leads guardados entre esas dos fechas (inclusive), en
 * horario argentino. Pensado para "ver leads anteriores a hoy": el panel
 * manda el rango, acá solo se valida y se traduce a UTC para la consulta.
 */
export async function GET(req: Request) {
    if (!(await sesion())) {
        return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde") ?? "";
    const hasta = searchParams.get("hasta") ?? desde;

    if (!FECHA_RE.test(desde) || !FECHA_RE.test(hasta)) {
        return NextResponse.json({ error: "desde/hasta deben ser AAAA-MM-DD" }, { status: 400 });
    }
    if (desde > hasta) {
        return NextResponse.json({ error: "'desde' es posterior a 'hasta'" }, { status: 400 });
    }

    const db = supabaseServidor();
    const { data, error } = await db
        .from("leads_ganchos")
        .select("id, creado_en, gancho, numero, nombre, usuario, canal, fecha_nac")
        .gte("creado_en", `${desde}T00:00:00-03:00`)
        .lte("creado_en", `${hasta}T23:59:59.999-03:00`)
        .order("creado_en", { ascending: false })
        .limit(LIMITE_MAX);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, leads: data ?? [], limite: LIMITE_MAX });
}
