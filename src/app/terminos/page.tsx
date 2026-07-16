export const metadata = { title: "Términos y reintegros" };

/** TODO legal: revisar con la normativa vigente antes de publicar.
 *  En Argentina, la venta online exige botón de arrepentimiento visible
 *  (Res. 424/2020) y plazo de 10 días corridos para revocar la compra. */
export default function Terminos() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-3xl">Términos y reintegros</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-noche/80">
        <h2 className="text-lg">Qué comprás</h2>
        <p>
          Un taller en formato PDF, de descarga inmediata, para uso personal. El
          archivo lleva tu nombre y tu mail en cada página. No está permitido
          redistribuirlo ni revenderlo.
        </p>

        <h2 className="text-lg">Arrepentimiento</h2>
        <p>
          Tenés 10 días corridos desde la compra para arrepentirte y pedir el reintegro
          total, escribiendo a hola@sientoluz.com con tu número de orden. Es tu derecho
          y no hace falta que expliques por qué.
        </p>

        <h2 className="text-lg">Los talleres no son tratamiento médico</h2>
        <p>
          El contenido de SientoLuz acompaña procesos personales y no reemplaza ninguna
          consulta médica ni psicológica. Si estás en tratamiento, seguí con tu
          profesional.
        </p>
      </div>
    </div>
  );
}
