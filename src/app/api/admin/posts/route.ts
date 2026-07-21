import { NextResponse } from "next/server";
import { sesion } from "@/lib/admin-sesion";
import { supabaseServidor } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "posts-programados";

/**
 * Crea un post programado a partir de una tarjeta del panel: una imagen, con
 * su propio caption/hashtags/fecha/toggles. El panel llama esto una vez por
 * tarjeta, así cada imagen queda como una fila 'pending' independiente.
 */
export async function POST(req: Request) {
  if (!(await sesion())) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Formulario inválido" }, { status: 400 });

  const caption = String(form.get("caption") ?? "").trim();
  const hashtags = String(form.get("hashtags") ?? "").trim() || null;
  const scheduledAt = String(form.get("scheduled_at") ?? "");
  const publishFb = form.get("publish_fb") === "true";
  const publishIg = form.get("publish_ig") === "true";
  const imagen = form.get("imagen");

  if (!(imagen instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  }
  if (!caption) return NextResponse.json({ error: "Falta el caption" }, { status: 400 });
  if (!scheduledAt || Number.isNaN(Date.parse(scheduledAt))) {
    return NextResponse.json({ error: "Fecha/hora inválida" }, { status: 400 });
  }

  const db = supabaseServidor();
  const carpeta = new Date(scheduledAt).toISOString().slice(0, 7); // AAAA-MM

  try {
    const limpio = imagen.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const ruta = `${carpeta}/${crypto.randomUUID()}-${limpio}`;

    const subida = await db.storage.from(BUCKET).upload(ruta, imagen, {
      contentType: imagen.type || "image/jpeg",
    });
    if (subida.error) throw new Error(`Subiendo '${imagen.name}': ${subida.error.message}`);

    const { data: publica } = db.storage.from(BUCKET).getPublicUrl(ruta);

    const { data: fila, error } = await db
      .from("posts_programados")
      .insert({
        caption,
        hashtags,
        image_path: ruta,
        image_url: publica.publicUrl,
        scheduled_at: scheduledAt,
        publish_fb: publishFb,
        publish_ig: publishIg,
      })
      .select()
      .single();
    if (error) throw new Error(`Guardando '${imagen.name}': ${error.message}`);

    return NextResponse.json({ ok: true, post: fila });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/posts] crear:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
