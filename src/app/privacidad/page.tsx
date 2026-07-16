export const metadata = { title: "Privacidad" };

/** TODO legal: revisar antes de publicar (Ley 25.326 de datos personales). */
export default function Privacidad() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-3xl">Privacidad</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-noche/80">
        <h2 className="text-lg">Qué guardamos</h2>
        <p>
          Tu nombre, tu email y —si lo dejaste— tu WhatsApp. Los usamos para entregarte
          el material, emitir tu certificado y responderte. Nada más.
        </p>

        <h2 className="text-lg">Novedades</h2>
        <p>
          Solo te escribimos con novedades si lo marcaste al comprar. Podés darte de
          baja desde cualquier mail, en un clic.
        </p>

        <h2 className="text-lg">Pagos</h2>
        <p>
          No vemos ni guardamos datos de tu tarjeta: el pago lo procesa Mercado Pago en
          su propio sitio.
        </p>

        <h2 className="text-lg">Tus datos son tuyos</h2>
        <p>
          Podés pedir que te los mostremos, los corrijamos o los borremos escribiendo a
          hola@sientoluz.com.
        </p>
      </div>
    </div>
  );
}
