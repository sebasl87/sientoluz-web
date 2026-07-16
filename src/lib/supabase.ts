import { createClient } from "@supabase/supabase-js";

/** Cliente público: solo lee el catálogo (RLS lo limita a activo = true). */
export function supabasePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/** Cliente de servidor: escribe órdenes y firma descargas. Nunca en el browser. */
export function supabaseServidor() {
  if (typeof window !== "undefined") {
    throw new Error("supabaseServidor() solo puede usarse del lado del servidor");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
