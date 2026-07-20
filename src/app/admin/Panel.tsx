"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { precio } from "@/lib/formato";

export type OrdenPanel = {
  id: string;
  numero: string;
  estado: "pendiente" | "pagado" | "entregado" | "cancelado";
  metodo: "mercadopago" | "transferencia";
  total_ars: number;
  creado_en: string;
  pagado_en: string | null;
  entregado_en: string | null;
  clientes: { nombre: string; email: string; telefono: string | null };
  orden_items: { nombre: string; precio_ars: number }[];
};

const fecha = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Argentina/Buenos_Aires",
      })
    : "—";

const haceCuanto = (iso: string) => {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
};

function Tarjeta({
  orden,
  children,
  destacada,
}: {
  orden: OrdenPanel;
  children?: React.ReactNode;
  destacada?: boolean;
}) {
  return (
    <li
      className={`rounded-sm border bg-white/40 p-4 ${
        destacada ? "border-red-300 bg-red-50/40" : "border-lavanda"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-titulo text-base">{orden.clientes?.nombre}</p>
          {/* El mail es lo que más vas a mirar: seleccionable, entero. */}
          <p className="mt-0.5 truncate text-sm text-noche/70 select-all">
            {orden.clientes?.email}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-titulo text-base">{precio(orden.total_ars)}</p>
          <p className="text-xs text-noche/50">{orden.numero}</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-noche/60">
        {orden.orden_items?.map((i) => i.nombre).join(" · ")}
      </p>

      <p className="mt-1 text-xs text-noche/45">
        {orden.metodo === "transferencia" ? "Transferencia" : "Mercado Pago"} ·{" "}
        {fecha(orden.creado_en)} · {haceCuanto(orden.creado_en)}
        {orden.clientes?.telefono ? ` · ${orden.clientes.telefono}` : ""}
      </p>

      {children}
    </li>
  );
}

export default function Panel({
  pendientes,
  trabadas,
  entregadas,
  error,
}: {
  pendientes: OrdenPanel[];
  trabadas: OrdenPanel[];
  entregadas: OrdenPanel[];
  error: string | null;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function accionar(accion: string, orden: OrdenPanel) {
    setCargando(`${accion}:${orden.id}`);
    setAviso(null);
    try {
      const r = await fetch("/api/admin/accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, ordenId: orden.id }),
      });
      const d = await r.json();
      setAviso(
        r.ok
          ? { ok: true, texto: `${orden.numero}: ${d.mensaje}` }
          : { ok: false, texto: `${orden.numero}: ${d.error}` }
      );
      startTransition(() => router.refresh());
    } catch (e) {
      setAviso({ ok: false, texto: e instanceof Error ? e.message : "Error de red" });
    } finally {
      setCargando(null);
      setConfirmar(null);
    }
  }

  const ocupado = (accion: string, id: string) => cargando === `${accion}:${id}`;

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-titulo text-2xl">Panel</h1>
        <form action="/api/admin/salir" method="post">
          <button className="text-xs text-noche/50 underline underline-offset-2">Salir</button>
        </form>
      </header>

      {error && (
        <p className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {aviso && (
        <p
          className={`mb-4 rounded-sm px-4 py-2 text-sm ${
            aviso.ok
              ? "border border-jade/30 bg-jade/10 text-noche"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {aviso.texto}
        </p>
      )}

      <section className="mb-8 rounded-sm border border-lavanda bg-white/50 p-4">
        <p className="text-xs uppercase tracking-widest text-noche/45">Herramientas</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-titulo text-base">Generador de ganchos</p>
            <p className="text-sm text-noche/60">Abrilo desde la extranet para usarlo después del login.</p>
          </div>
          <Link
            href="/admin/ganchos"
            className="shrink-0 rounded-sm bg-amatista px-4 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            Abrir
          </Link>
        </div>
      </section>

      {/* ── Lo más urgente: cobraste y no entregaste ── */}
      {trabadas.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-red-700">
            Falló la entrega · {trabadas.length}
          </h2>
          <p className="mb-3 text-xs leading-relaxed text-noche/60">
            Están pagadas pero el cliente no recibió nada. Reintentar es seguro:
            no manda el mail dos veces si ya salió.
          </p>
          <ul className="space-y-3">
            {trabadas.map((o) => (
              <Tarjeta key={o.id} orden={o} destacada>
                <button
                  onClick={() => accionar("reintentar", o)}
                  disabled={!!cargando}
                  className="mt-3 w-full rounded-sm bg-amatista py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {ocupado("reintentar", o.id) ? "Entregando…" : "Reintentar entrega"}
                </button>
              </Tarjeta>
            ))}
          </ul>
        </section>
      )}

      {/* ── Transferencias a aprobar ── */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs uppercase tracking-widest text-noche/50">
          Para aprobar · {pendientes.length}
        </h2>

        {pendientes.length === 0 ? (
          <p className="rounded-sm border border-lavanda bg-white/40 px-4 py-6 text-center text-sm text-noche/50">
            Nada pendiente.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs leading-relaxed text-noche/60">
              Chequeá el monto en tu banco antes de aprobar. El comprobante que
              te mandan por WhatsApp es referencia, no prueba.
            </p>
            <ul className="space-y-3">
              {pendientes.map((o) => (
                <Tarjeta key={o.id} orden={o}>
                  {confirmar === o.id ? (
                    <div className="mt-3 rounded-sm border border-lavanda bg-white/60 p-3">
                      <p className="text-xs text-noche/70">
                        ¿Cancelar {o.numero}? El cliente no recibe nada.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => accionar("rechazar", o)}
                          disabled={!!cargando}
                          className="flex-1 rounded-sm border border-red-300 py-2 text-xs text-red-700 disabled:opacity-50"
                        >
                          {ocupado("rechazar", o.id) ? "…" : "Sí, cancelar"}
                        </button>
                        <button
                          onClick={() => setConfirmar(null)}
                          className="flex-1 rounded-sm border border-lavanda py-2 text-xs text-noche/60"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => accionar("aprobar", o)}
                        disabled={!!cargando}
                        className="flex-1 rounded-sm bg-jade py-2.5 text-sm text-white transition-colors hover:bg-jade-hover disabled:opacity-50"
                      >
                        {ocupado("aprobar", o.id) ? "Entregando…" : "Aprobar y entregar"}
                      </button>
                      <button
                        onClick={() => setConfirmar(o.id)}
                        disabled={!!cargando}
                        className="rounded-sm border border-lavanda px-4 text-sm text-noche/50 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </Tarjeta>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ── Contexto ── */}
      {entregadas.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs uppercase tracking-widest text-noche/40">
            Últimas entregadas
          </h2>
          <ul className="space-y-2">
            {entregadas.map((o) => (
              <li
                key={o.id}
                className="flex items-baseline justify-between gap-3 border-b border-lavanda/60 pb-2 text-xs"
              >
                <span className="truncate text-noche/70">{o.clientes?.nombre}</span>
                <span className="shrink-0 text-noche/40">
                  {precio(o.total_ars)} · {fecha(o.entregado_en)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
