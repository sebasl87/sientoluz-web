import { NextResponse } from "next/server";
import { sesion } from "@/lib/admin-sesion";
import { supabaseServidor } from "@/lib/supabase";
import { obtenerFila, publicarFila, reintentarRed, type Red } from "@/lib/social/cola";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "posts-programados";

/**
 * Las acciones del panel de posts, mismo esquema que api/admin/accion:
 *
 *  reintentar     una red en 'failed' → 'pending' → se publica en el momento
 *  publicarAhora  publica ya las redes que sigan 'pending' de la fila
 *  eliminar       borra la fila (solo si ninguna red se intentó todavía)
 *  editar         cambia caption/hashtags/fecha/toggles (mismo requisito)
 */
export async function POST(req: Request) {
  if (!(await sesion())) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    accion?: string;
    id?: string;
    red?: Red;
    caption?: string;
    hashtags?: string | null;
    scheduled_at?: string;
    publish_fb?: boolean;
    publish_ig?: boolean;
  };
  if (!body.id) return NextResponse.json({ error: "Falta el post" }, { status: 400 });

  const db = supabaseServidor();

  try {
    if (body.accion === "reintentar") {
      if (body.red !== "fb" && body.red !== "ig") {
        return NextResponse.json({ error: "Falta la red" }, { status: 400 });
      }
      await reintentarRed(body.id, body.red);
      return NextResponse.json({ ok: true });
    }

    if (body.accion === "publicarAhora") {
      const fila = await obtenerFila(body.id);
      if (!fila) return NextResponse.json({ error: "Post inexistente" }, { status: 404 });
      await Promise.all([publicarFila(fila, "fb"), publicarFila(fila, "ig")]);
      return NextResponse.json({ ok: true });
    }

    if (body.accion === "eliminar") {
      const { data: fila } = await db
        .from("posts_programados")
        .select("id, image_path, fb_status, ig_status")
        .eq("id", body.id)
        .maybeSingle();
      if (!fila) return NextResponse.json({ error: "Post inexistente" }, { status: 404 });
      if (fila.fb_status !== "pending" || fila.ig_status !== "pending") {
        return NextResponse.json(
          { error: "Ya se intentó publicar: no se puede borrar" },
          { status: 409 }
        );
      }
      await db.from("posts_programados").delete().eq("id", fila.id);
      await db.storage.from(BUCKET).remove([fila.image_path]);
      return NextResponse.json({ ok: true });
    }

    if (body.accion === "editar") {
      const { data: fila } = await db
        .from("posts_programados")
        .select("id, fb_status, ig_status")
        .eq("id", body.id)
        .maybeSingle();
      if (!fila) return NextResponse.json({ error: "Post inexistente" }, { status: 404 });
      if (fila.fb_status !== "pending" || fila.ig_status !== "pending") {
        return NextResponse.json(
          { error: "Ya se intentó publicar: no se puede editar" },
          { status: 409 }
        );
      }
      if (!body.caption?.trim()) {
        return NextResponse.json({ error: "Falta el caption" }, { status: 400 });
      }
      const { error } = await db
        .from("posts_programados")
        .update({
          caption: body.caption.trim(),
          hashtags: body.hashtags?.trim() || null,
          scheduled_at: body.scheduled_at,
          publish_fb: body.publish_fb ?? true,
          publish_ig: body.publish_ig ?? true,
        })
        .eq("id", fila.id);
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[admin/posts/accion] ${body.accion} ${body.id}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
