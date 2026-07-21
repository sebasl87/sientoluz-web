"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { artAUtcIso, utcIsoAArtLocal, enFranjaDeCron, formatoArt } from "@/lib/social/horario";

export type PostFila = {
  id: string;
  caption: string;
  hashtags: string | null;
  image_path: string;
  image_url: string;
  scheduled_at: string;
  publish_fb: boolean;
  publish_ig: boolean;
  fb_status: string;
  ig_status: string;
  fb_post_id: string | null;
  ig_post_id: string | null;
  fb_error: string | null;
  ig_error: string | null;
  attempts: number;
  published_at: string | null;
  created_at: string;
};

const ETIQUETA: Record<string, string> = {
  pending: "Pendiente",
  publishing: "Publicando…",
  published: "Publicado",
  failed: "Falló",
  skipped: "No aplica",
};

function claseEstado(estado: string) {
  if (estado === "published") return "border-jade/30 bg-jade/10 text-jade-hover";
  if (estado === "failed") return "border-red-200 bg-red-50 text-red-700";
  if (estado === "publishing") return "border-amatista/30 bg-amatista/10 text-amatista";
  return "border-lavanda bg-white/60 text-noche/60";
}

function Badge({ estado }: { estado: string }) {
  return (
    <span className={`rounded-sm border px-2 py-0.5 text-xs ${claseEstado(estado)}`}>
      {ETIQUETA[estado] ?? estado}
    </span>
  );
}

export default function Posts({
  filas,
  error,
  maxIntentos,
}: {
  filas: PostFila[];
  error: string | null;
  maxIntentos: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [cargando, setCargando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  // ── Form de alta ──
  const inputArchivos = useRef<HTMLInputElement>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [publishFb, setPublishFb] = useState(true);
  const [publishIg, setPublishIg] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  function refrescar() {
    startTransition(() => router.refresh());
  }

  async function accionar(accion: string, body: Record<string, unknown>, etiqueta: string) {
    setCargando(etiqueta);
    setAviso(null);
    try {
      const r = await fetch("/api/admin/posts/accion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, ...body }),
      });
      const d = await r.json();
      setAviso(r.ok ? { ok: true, texto: "Listo." } : { ok: false, texto: d.error });
      refrescar();
    } catch (e) {
      setAviso({ ok: false, texto: e instanceof Error ? e.message : "Error de red" });
    } finally {
      setCargando(null);
      setConfirmarBorrado(null);
    }
  }

  async function programar(e: React.FormEvent) {
    e.preventDefault();
    if (archivos.length === 0) {
      setAviso({ ok: false, texto: "Subí al menos una imagen." });
      return;
    }
    if (!fechaHora) {
      setAviso({ ok: false, texto: "Elegí fecha y hora." });
      return;
    }

    setSubiendo(true);
    setAviso(null);
    try {
      const form = new FormData();
      form.set("caption", caption);
      form.set("hashtags", hashtags);
      form.set("scheduled_at", artAUtcIso(fechaHora));
      form.set("publish_fb", String(publishFb));
      form.set("publish_ig", String(publishIg));
      archivos.forEach((a) => form.append("imagenes", a));

      const r = await fetch("/api/admin/posts", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "No se pudo programar");

      setAviso({ ok: true, texto: `Programados ${d.creados} post(s).` });
      setArchivos([]);
      setCaption("");
      setHashtags("");
      setFechaHora("");
      setPublishFb(true);
      setPublishIg(true);
      if (inputArchivos.current) inputArchivos.current.value = "";
      refrescar();
    } catch (e) {
      setAviso({ ok: false, texto: e instanceof Error ? e.message : "Error de red" });
    } finally {
      setSubiendo(false);
    }
  }

  const ocupado = (etiqueta: string) => cargando === etiqueta;
  const fueraDeFranja = fechaHora !== "" && !enFranjaDeCron(fechaHora);

  const fallidos = filas.filter((f) => f.fb_status === "failed" || f.ig_status === "failed");
  const resto = filas.filter((f) => !fallidos.includes(f));

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <h1 className="mb-6 font-titulo text-2xl">Posts programados</h1>

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

      {/* ── Alta ── */}
      <section className="mb-8 rounded-sm border border-lavanda bg-white/50 p-4">
        <p className="mb-3 text-xs uppercase tracking-widest text-noche/45">Programar nuevos</p>
        <form onSubmit={programar} className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              setArchivos(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
            }}
            onClick={() => inputArchivos.current?.click()}
            className={`cursor-pointer rounded-sm border-2 border-dashed p-6 text-center text-sm transition-colors ${
              arrastrando ? "border-amatista bg-amatista/5" : "border-lavanda text-noche/50"
            }`}
          >
            {archivos.length > 0
              ? `${archivos.length} imagen(es) seleccionada(s)`
              : "Arrastrá imágenes acá o hacé clic para elegirlas"}
            <input
              ref={inputArchivos}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
            />
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
            required
            rows={3}
            className="w-full rounded-sm border border-lavanda bg-white/80 p-2 text-sm"
          />
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#hashtags (opcional)"
            className="w-full rounded-sm border border-lavanda bg-white/80 p-2 text-sm"
          />

          <div>
            <label className="mb-1 block text-xs text-noche/50">Fecha y hora (Argentina)</label>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              required
              className="w-full rounded-sm border border-lavanda bg-white/80 p-2 text-sm"
            />
            {fueraDeFranja && (
              <p className="mt-1 text-xs text-amber-700">
                Ojo: el cron solo corre 08–11 y 15–20 ART. Programado fuera de esa franja,
                se publica en la próxima corrida dentro de ella.
              </p>
            )}
          </div>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={publishFb} onChange={(e) => setPublishFb(e.target.checked)} />
              Facebook
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={publishIg} onChange={(e) => setPublishIg(e.target.checked)} />
              Instagram
            </label>
          </div>

          <button
            type="submit"
            disabled={subiendo}
            className="w-full rounded-sm bg-amatista py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {subiendo ? "Subiendo…" : "Programar"}
          </button>
        </form>
      </section>

      {/* ── Fallidos ── */}
      {fallidos.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-red-700">
            Necesitan atención · {fallidos.length}
          </h2>
          <ul className="space-y-3">
            {fallidos.map((f) => (
              <Tarjeta
                key={f.id}
                fila={f}
                destacada
                editando={editando === f.id}
                onEditar={() => setEditando(editando === f.id ? null : f.id)}
                confirmarBorrado={confirmarBorrado === f.id}
                onPedirBorrado={() => setConfirmarBorrado(f.id)}
                onCancelarBorrado={() => setConfirmarBorrado(null)}
                ocupado={ocupado}
                accionar={accionar}
                maxIntentos={maxIntentos}
              />
            ))}
          </ul>
        </section>
      )}

      {/* ── Resto ── */}
      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-noche/50">
          Todos · {resto.length}
        </h2>
        {resto.length === 0 ? (
          <p className="rounded-sm border border-lavanda bg-white/40 px-4 py-6 text-center text-sm text-noche/50">
            Nada programado.
          </p>
        ) : (
          <ul className="space-y-3">
            {resto.map((f) => (
              <Tarjeta
                key={f.id}
                fila={f}
                editando={editando === f.id}
                onEditar={() => setEditando(editando === f.id ? null : f.id)}
                confirmarBorrado={confirmarBorrado === f.id}
                onPedirBorrado={() => setConfirmarBorrado(f.id)}
                onCancelarBorrado={() => setConfirmarBorrado(null)}
                ocupado={ocupado}
                accionar={accionar}
                maxIntentos={maxIntentos}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tarjeta({
  fila,
  destacada,
  editando,
  onEditar,
  confirmarBorrado,
  onPedirBorrado,
  onCancelarBorrado,
  ocupado,
  accionar,
  maxIntentos,
}: {
  fila: PostFila;
  destacada?: boolean;
  editando: boolean;
  onEditar: () => void;
  confirmarBorrado: boolean;
  onPedirBorrado: () => void;
  onCancelarBorrado: () => void;
  ocupado: (etiqueta: string) => boolean;
  accionar: (accion: string, body: Record<string, unknown>, etiqueta: string) => Promise<void>;
  maxIntentos: number;
}) {
  const nuncaIntentado = fila.fb_status === "pending" && fila.ig_status === "pending";
  const [ec, seteC] = useState(fila.caption);
  const [eh, seteH] = useState(fila.hashtags ?? "");
  const [ef, seteF] = useState(utcIsoAArtLocal(fila.scheduled_at));
  const [efb, seteFb] = useState(fila.publish_fb);
  const [eig, seteIg] = useState(fila.publish_ig);

  return (
    <li className={`rounded-sm border bg-white/40 p-4 ${destacada ? "border-red-300 bg-red-50/40" : "border-lavanda"}`}>
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fila.image_url} alt="" className="h-16 w-16 shrink-0 rounded-sm object-cover" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm text-noche/80">{fila.caption}</p>
          <p className="mt-1 text-xs text-noche/45">{formatoArt(fila.scheduled_at)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {fila.publish_fb && <Badge estado={fila.fb_status} />}
            {fila.publish_ig && <Badge estado={fila.ig_status} />}
            {!fila.publish_fb && <span className="text-xs text-noche/35">FB desactivado</span>}
            {!fila.publish_ig && <span className="text-xs text-noche/35">IG desactivado</span>}
          </div>
          {fila.fb_error && fila.fb_status === "failed" && (
            <p className="mt-1 text-xs text-red-700">FB: {fila.fb_error}</p>
          )}
          {fila.ig_error && fila.ig_status === "failed" && (
            <p className="mt-1 text-xs text-red-700">IG: {fila.ig_error}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {fila.fb_status === "failed" &&
          (fila.attempts >= maxIntentos ? (
            <span className="text-xs text-red-700">FB: máximo de reintentos alcanzado</span>
          ) : (
            <button
              onClick={() => accionar("reintentar", { id: fila.id, red: "fb" }, `reintentar-fb-${fila.id}`)}
              disabled={ocupado(`reintentar-fb-${fila.id}`)}
              className="rounded-sm border border-red-300 px-3 py-1.5 text-xs text-red-700 disabled:opacity-50"
            >
              {ocupado(`reintentar-fb-${fila.id}`) ? "…" : "Reintentar FB"}
            </button>
          ))}
        {fila.ig_status === "failed" &&
          (fila.attempts >= maxIntentos ? (
            <span className="text-xs text-red-700">IG: máximo de reintentos alcanzado</span>
          ) : (
            <button
              onClick={() => accionar("reintentar", { id: fila.id, red: "ig" }, `reintentar-ig-${fila.id}`)}
              disabled={ocupado(`reintentar-ig-${fila.id}`)}
              className="rounded-sm border border-red-300 px-3 py-1.5 text-xs text-red-700 disabled:opacity-50"
            >
              {ocupado(`reintentar-ig-${fila.id}`) ? "…" : "Reintentar IG"}
            </button>
          ))}
        {nuncaIntentado && (
          <button
            onClick={() => accionar("publicarAhora", { id: fila.id }, `ahora-${fila.id}`)}
            disabled={ocupado(`ahora-${fila.id}`)}
            className="rounded-sm bg-jade px-3 py-1.5 text-xs text-white transition-colors hover:bg-jade-hover disabled:opacity-50"
          >
            {ocupado(`ahora-${fila.id}`) ? "Publicando…" : "Publicar ahora"}
          </button>
        )}
        {nuncaIntentado && (
          <button
            onClick={onEditar}
            className="rounded-sm border border-lavanda px-3 py-1.5 text-xs text-noche/60"
          >
            {editando ? "Cerrar" : "Editar"}
          </button>
        )}
        {nuncaIntentado &&
          (confirmarBorrado ? (
            <span className="flex items-center gap-2 text-xs">
              ¿Borrar?
              <button
                onClick={() => accionar("eliminar", { id: fila.id }, `borrar-${fila.id}`)}
                disabled={ocupado(`borrar-${fila.id}`)}
                className="rounded-sm border border-red-300 px-2 py-1 text-red-700"
              >
                Sí
              </button>
              <button onClick={onCancelarBorrado} className="rounded-sm border border-lavanda px-2 py-1">
                No
              </button>
            </span>
          ) : (
            <button onClick={onPedirBorrado} className="rounded-sm px-3 py-1.5 text-xs text-noche/40 underline">
              Eliminar
            </button>
          ))}
      </div>

      {editando && (
        <div className="mt-3 space-y-2 rounded-sm border border-lavanda bg-white/60 p-3">
          <textarea
            value={ec}
            onChange={(e) => seteC(e.target.value)}
            rows={2}
            className="w-full rounded-sm border border-lavanda bg-white p-2 text-xs"
          />
          <input
            value={eh}
            onChange={(e) => seteH(e.target.value)}
            placeholder="#hashtags"
            className="w-full rounded-sm border border-lavanda bg-white p-2 text-xs"
          />
          <input
            type="datetime-local"
            value={ef}
            onChange={(e) => seteF(e.target.value)}
            className="w-full rounded-sm border border-lavanda bg-white p-2 text-xs"
          />
          <div className="flex gap-4 text-xs">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={efb} onChange={(e) => seteFb(e.target.checked)} />
              Facebook
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={eig} onChange={(e) => seteIg(e.target.checked)} />
              Instagram
            </label>
          </div>
          <button
            onClick={() =>
              accionar(
                "editar",
                {
                  id: fila.id,
                  caption: ec,
                  hashtags: eh,
                  scheduled_at: artAUtcIso(ef),
                  publish_fb: efb,
                  publish_ig: eig,
                },
                `editar-${fila.id}`
              )
            }
            disabled={ocupado(`editar-${fila.id}`)}
            className="w-full rounded-sm bg-amatista py-2 text-xs text-white disabled:opacity-50"
          >
            {ocupado(`editar-${fila.id}`) ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      )}
    </li>
  );
}
