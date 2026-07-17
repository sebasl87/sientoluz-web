"use client";

import { useState } from "react";

type Metodo = "mercadopago" | "transferencia";

type Props = {
  tipo: "curso" | "kit";
  slug: string;
  /** Si las credenciales de Mercado Pago no están cargadas, esa opción no se ofrece. */
  mpDisponible: boolean;
};

export default function FormularioCompra({ tipo, slug, mpDisponible }: Props) {
  const [metodo, setMetodo] = useState<Metodo>(mpDisponible ? "mercadopago" : "transferencia");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function comprar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const datos = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          slug,
          metodo,
          nombre: datos.get("nombre"),
          email: datos.get("email"),
          telefono: datos.get("telefono"),
          acepta_novedades: datos.get("novedades") === "on",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "No pudimos crear la orden.");
      window.location.href = json.url;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos crear la orden. Probá de nuevo."
      );
      setEnviando(false);
    }
  }

  const campo =
    "mt-1.5 w-full rounded-sm border border-lavanda bg-white/60 px-3.5 py-2.5 text-sm text-noche placeholder:text-noche/35 focus:border-lila focus:outline-none";
  const etiqueta = "font-titulo text-[0.65rem] tracking-[0.2em] uppercase text-noche/60";

  return (
    <form onSubmit={comprar} noValidate={false}>
      <div className="space-y-5">
        <div>
          <label htmlFor="nombre" className={etiqueta}>
            Nombre y apellido
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            autoComplete="name"
            className={campo}
            placeholder="Como querés que figure en tu certificado"
          />
        </div>
        <div>
          <label htmlFor="email" className={etiqueta}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={campo}
            placeholder="Acá te mandamos el material"
          />
        </div>
        <div>
          <label htmlFor="telefono" className={etiqueta}>
            WhatsApp <span className="normal-case tracking-normal">(opcional)</span>
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            className={campo}
            placeholder="Por si necesitás una mano con el taller"
          />
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className={etiqueta}>Cómo querés pagar</legend>
        <div className="mt-3 space-y-3">
          {(
            [
              ...(mpDisponible
                ? ([
                    ["mercadopago", "Mercado Pago", "Tarjeta, débito o dinero en cuenta. El material te llega en minutos."],
                  ] as const)
                : []),
              ["transferencia", "Transferencia bancaria", "Te damos el CBU y nos mandás el comprobante. Lo confirmamos el mismo día."],
            ] as const
          ).map(([valor, titulo, texto]) => (
            <label
              key={valor}
              className={`flex cursor-pointer gap-3 rounded-sm border p-4 transition-colors ${
                metodo === valor ? "border-lila bg-lavanda/30" : "border-lavanda bg-white/40"
              }`}
            >
              <input
                type="radio"
                name="metodo"
                value={valor}
                checked={metodo === valor}
                onChange={() => setMetodo(valor)}
                className="mt-1 accent-[var(--color-jade)]"
              />
              <span>
                <span className="block text-sm font-semibold">{titulo}</span>
                <span className="mt-1 block text-xs leading-relaxed text-noche/65">{texto}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-6 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-noche/65">
        <input type="checkbox" name="novedades" className="mt-0.5 accent-[var(--color-jade)]" />
        Quiero recibir las novedades de SientoLuz: rituales de luna, promos y cursos nuevos.
      </label>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-amatista/40 bg-amatista/5 px-4 py-3 text-sm text-amatista"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-8 w-full rounded-sm bg-jade px-6 py-3.5 font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover disabled:opacity-55"
      >
        {enviando
          ? "Creando tu orden…"
          : metodo === "mercadopago"
            ? "Pagar con Mercado Pago"
            : "Ver datos de transferencia"}
      </button>
    </form>
  );
}
