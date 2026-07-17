import { redirect } from "next/navigation";
import { sesion } from "@/lib/admin-sesion";
import { supabaseServidor } from "@/lib/supabase";
import Panel from "./Panel";
import type { OrdenPanel } from "./Panel";

export const dynamic = "force-dynamic";

/**
 * El panel. Muestra dos grupos:
 *
 *  · Para aprobar  — transferencias en 'pendiente'. Vos mirás tu banco y
 *    aprobás. El comprobante que te llega por WhatsApp es la referencia;
 *    tu cuenta es la verdad.
 *  · Falló la entrega — órdenes en 'pagado' que quedaron sin entregar:
 *    cobraste y el cliente no recibió. Es lo más urgente que puede haber
 *    acá, así que va primero.
 *
 * Y abajo, las últimas entregadas, para tener contexto.
 */
export default async function PanelAdmin() {
  // El middleware ya redirige si no hay cookie, pero solo mira que exista:
  // corre en el Edge y no puede verificar la firma. Acá sí.
  if (!(await sesion())) redirect("/admin/entrar");

  const db = supabaseServidor();
  const columnas = `id, numero, estado, metodo, total_ars, creado_en, pagado_en, entregado_en,
                    clientes ( nombre, email, telefono ),
                    orden_items ( nombre, precio_ars )`;

  const [pendientes, trabadas, entregadas] = await Promise.all([
    db.from("ordenes").select(columnas).eq("estado", "pendiente").order("creado_en", { ascending: false }),
    db.from("ordenes").select(columnas).eq("estado", "pagado").order("pagado_en", { ascending: false }),
    db.from("ordenes").select(columnas).eq("estado", "entregado").order("entregado_en", { ascending: false }).limit(10),
  ]);

  const error = pendientes.error ?? trabadas.error ?? entregadas.error;

  return (
    <Panel
      pendientes={(pendientes.data ?? []) as unknown as OrdenPanel[]}
      trabadas={(trabadas.data ?? []) as unknown as OrdenPanel[]}
      entregadas={(entregadas.data ?? []) as unknown as OrdenPanel[]}
      error={error?.message ?? null}
    />
  );
}
