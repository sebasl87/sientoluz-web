export const metadata = { title: "Términos y reintegros" };

export default function Terminos() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Antes de comprar</p>
      <h1 className="mt-3 text-3xl">Términos y reintegros</h1>
      <p className="mt-5 leading-relaxed text-noche/75">
        Esto es lo que necesitás saber antes de comprar un taller en SientoLuz, en
        criollo y sin letra chica. Rige para toda venta hecha desde sientoluz.com y
        cumple con la Ley 24.240 de Defensa del Consumidor y la Resolución 424/2020
        de Comercio Electrónico.
      </p>

      <div className="mt-10 space-y-8 leading-relaxed text-noche/80">
        <section>
          <h2 className="text-lg">Quién vende</h2>
          <p className="mt-3">
            SientoLuz es un emprendimiento personal dedicado a la enseñanza de
            numerología, péndulo y prácticas energéticas. Cualquier consulta sobre
            una compra se responde por hola@sientoluz.com.
          </p>
        </section>

        <section>
          <h2 className="text-lg">Qué comprás</h2>
          <p className="mt-3">
            Un taller en formato PDF, de descarga inmediata, para tu uso personal. El
            archivo lleva tu nombre y tu mail en cada página. No está permitido
            copiarlo, redistribuirlo, revenderlo ni compartirlo: es la forma en que
            este trabajo se sostiene.
          </p>
        </section>

        <section>
          <h2 className="text-lg">Precio, pago y entrega</h2>
          <p className="mt-3">
            El precio que ves en la ficha del curso es el precio final, en pesos
            argentinos. Podés pagar con Mercado Pago o por transferencia bancaria.
            Con Mercado Pago la compra se confirma al instante; por transferencia, la
            confirmamos el mismo día hábil de recibir tu comprobante. En ambos casos
            recibís el material por mail apenas se acredita el pago.
          </p>
        </section>

        <section className="rounded-sm border border-lavanda bg-lavanda/15 p-6">
          <h2 className="text-lg">Botón de arrepentimiento</h2>
          <p className="mt-3">
            Tenés <strong>10 días corridos</strong> desde el momento de la compra
            para arrepentirte y pedir el reintegro total del dinero, sin dar ninguna
            explicación. Es tu derecho como consumidor (art. 34, Ley 24.240) y lo
            podés ejercer con un solo clic.
          </p>
          <p className="mt-3">
            Escribinos con el número de orden que te llegó por mail y te
            devolvemos el pago por el mismo medio en el que compraste, en un plazo
            máximo de 10 días hábiles.
          </p>
          <a
            href="mailto:hola@sientoluz.com?subject=Arrepentimiento%20de%20compra&body=Hola%2C%20quiero%20arrepentirme%20de%20mi%20compra.%0AN%C3%BAmero%20de%20orden%3A%20"
            className="mt-5 inline-block rounded-sm bg-jade px-6 py-3.5 text-center font-titulo text-xs tracking-[0.2em] uppercase text-white transition-colors hover:bg-jade-hover"
          >
            Arrepentirme de mi compra
          </a>
        </section>

        <section>
          <h2 className="text-lg">Los talleres no son tratamiento médico</h2>
          <p className="mt-3">
            El contenido de SientoLuz acompaña procesos personales de introspección y
            no reemplaza ningún diagnóstico, tratamiento ni consulta médica o
            psicológica. Si estás en tratamiento, seguí siempre las indicaciones de
            tu profesional de salud.
          </p>
        </section>

        <section>
          <h2 className="text-lg">Si algo sale mal</h2>
          <p className="mt-3">
            Si el archivo no te llegó, se abrió corrupto o hay cualquier problema con
            la entrega, escribinos: lo resolvemos por fuera del plazo de
            arrepentimiento, sin costo, porque es un error nuestro y no tuyo.
          </p>
        </section>

        <section>
          <h2 className="text-lg">Cambios en estos términos</h2>
          <p className="mt-3">
            Si en algún momento actualizamos esta página, la versión que vale es la
            que estaba vigente el día de tu compra. Los cambios nunca se aplican
            hacia atrás.
          </p>
        </section>

        <section>
          <h2 className="text-lg">Contacto</h2>
          <p className="mt-3">
            Para cualquier duda sobre tu compra, un reintegro o algo que no te
            cierra: hola@sientoluz.com. Contesto yo.
          </p>
        </section>
      </div>
    </div>
  );
}
