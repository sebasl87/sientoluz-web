// app/api/leads/route.ts
// Endpoint server-side: el cliente hace POST y acá insertamos con la
// SERVICE ROLE key (nunca sale al navegador). Ajustá nombres de env vars
// a los que ya usás en el panel.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

export async function POST(req: Request) {
    // ── GUARD ──────────────────────────────────────────────
    // Validá tu magic-link HMAC igual que en el resto del panel.
    // Ejemplo (reemplazá por tu util real):
    //   const ok = await verificarSesionAdmin();
    //   if (!ok) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
    // ───────────────────────────────────────────────────────

    try {
        const b = await req.json();
        const gancho = String(b?.gancho ?? "");
        const numero = String(b?.numero ?? "");
        if (!["camino", "alma", "talento", "vibra", "ambos"].includes(gancho) || !numero) {
            return NextResponse.json({ error: "datos inválidos" }, { status: 400 });
        }

        const { error } = await supabase.from("leads_ganchos").insert({
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