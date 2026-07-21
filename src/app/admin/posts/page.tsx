import Link from "next/link";
import { redirect } from "next/navigation";
import { sesion } from "@/lib/admin-sesion";
import { supabaseServidor } from "@/lib/supabase";
import { MAX_INTENTOS } from "@/lib/social/cola";
import Posts from "./Posts";
import type { PostFila } from "./Posts";

export const dynamic = "force-dynamic";

const COLUMNAS =
  "id, caption, hashtags, image_path, image_url, scheduled_at, publish_fb, publish_ig, " +
  "fb_status, ig_status, fb_post_id, ig_post_id, fb_error, ig_error, attempts, published_at, created_at";

export default async function PagePostsAdmin() {
  if (!(await sesion())) redirect("/admin/entrar");

  const db = supabaseServidor();
  const { data, error } = await db
    .from("posts_programados")
    .select(COLUMNAS)
    .order("scheduled_at", { ascending: false })
    .limit(200);

  return (
    <main className="min-h-dvh px-4 py-8">
      <div className="mx-auto mb-4 flex w-full max-w-2xl items-center justify-between gap-3">
        <Link href="/admin" className="text-sm text-amatista underline underline-offset-2">
          Volver al panel
        </Link>
        <form action="/api/admin/salir" method="post">
          <button className="text-sm text-noche/50 underline underline-offset-2">Salir</button>
        </form>
      </div>

      <Posts
        filas={(data ?? []) as unknown as PostFila[]}
        error={error?.message ?? null}
        maxIntentos={MAX_INTENTOS}
      />
    </main>
  );
}
