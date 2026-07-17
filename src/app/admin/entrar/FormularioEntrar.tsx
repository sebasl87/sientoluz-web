"use client";
import { useState } from "react";

export default function FormularioEntrar() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"listo" | "enviando" | "enviado">("listo");

  async function pedir() {
    if (!email.trim() || estado === "enviando") return;
    setEstado("enviando");
    await fetch("/api/admin/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <div className="w-full rounded-sm border border-lavanda bg-white/40 p-6 text-center">
        <p className="text-sm">Si ese mail es el del panel, ya salió el link.</p>
        <p className="mt-2 text-xs text-noche/55">Sirve por 15 minutos.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && pedir()}
        placeholder="tu@mail.com"
        className="w-full rounded-sm border border-lavanda bg-white/60 px-4 py-3 outline-none transition-colors focus:border-lila"
      />
      <button
        onClick={pedir}
        disabled={estado === "enviando"}
        className="mt-3 w-full rounded-sm bg-jade py-3 text-white transition-colors hover:bg-jade-hover disabled:opacity-50"
      >
        {estado === "enviando" ? "Mandando…" : "Mandarme el link"}
      </button>
    </div>
  );
}
