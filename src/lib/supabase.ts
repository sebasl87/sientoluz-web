import { createClient, type RealtimeClientOptions } from "@supabase/supabase-js";
import WebSocket from "ws";

const transporteWs = WebSocket as unknown as RealtimeClientOptions["transport"];

/** Cliente público: solo lee el catálogo (RLS lo limita a activo = true). */
export function supabasePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Cliente de servidor: escribe órdenes y firma descargas. Nunca en el browser.
 *
 * `realtime.transport` se fuerza a `ws` porque supabase-js@2.110+ exige un
 * WebSocket global (nativo desde Node 22) apenas se instancia el cliente, y
 * la Netlify Scheduled Function de publicar-posts corre en Node 20 (Netlify
 * no toma el NODE_VERSION del build para las funciones sueltas). Sin esto,
 * `createClient()` tira "Node.js detected but native WebSocket not found" y
 * el cron nunca llega a procesar ninguna fila.
 */
export function supabaseServidor() {
  if (typeof window !== "undefined") {
    throw new Error("supabaseServidor() solo puede usarse del lado del servidor");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false }, realtime: { transport: transporteWs } }
  );
}
