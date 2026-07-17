import Separador from "@/components/Separador";

export const metadata = { title: "Sobre mí" };

export default function SobreMi() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Quién está del otro lado</p>
      <h1 className="mt-3 text-3xl">Sobre mí</h1>

      <div className="mt-8 space-y-5 leading-relaxed text-noche/80">
        <p>
          Practico numerología, péndulo y trabajo energético desde 2010: primero por
          necesidad propia, después porque no pude parar de estudiar. Me formé en
          reiki, sanación arcturiana y otras técnicas, y con los años tomé cursos que
          fui desarmando y volviendo a armar a mi manera. Lo que hoy son los talleres
          de SientoLuz no es una copia de lo que aprendí: es eso, pasado por mi
          impronta.
        </p>
        <p>
          En la pandemia me nació la necesidad de compartirlo. Empezó como talleres
          sueltos por WhatsApp y terminó siendo una comunidad. Hoy SientoLuz vuelve
          con esos mismos contenidos, revisados y ampliados, y con la misma idea de
          siempre: yo no vengo a darte soluciones mágicas, vengo a compartir luz y
          herramientas para que armes tu propia experiencia. Esto no es magia, es
          trabajo. Yo te acompaño, pero lo hacés vos.
        </p>
      </div>

      <p className="ritual mt-10">
        Tu fecha de nacimiento guarda un mapa: aprendamos a leerlo juntos.
      </p>

      <Separador className="my-12" />

      <h2 className="text-lg">Hablemos</h2>
      <p className="mt-4 leading-relaxed text-noche/80">
        Si tenés una duda antes de comprar, o estás haciendo un taller y algo no te
        cierra, escribime. Contesto yo.
      </p>
      <div className="mt-6 flex flex-wrap gap-5 font-titulo text-xs tracking-[0.2em] uppercase">
        <a href="https://instagram.com/sientoluz" className="text-amatista underline-offset-4 hover:underline">Instagram</a>
        <a href="https://facebook.com/sientoluz" className="text-amatista underline-offset-4 hover:underline">Facebook</a>
        <a href="mailto:hola@sientoluz.com" className="text-amatista underline-offset-4 hover:underline">hola@sientoluz.com</a>
      </div>
    </div>
  );
}
