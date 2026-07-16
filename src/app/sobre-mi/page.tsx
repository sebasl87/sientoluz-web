import Separador from "@/components/Separador";

export const metadata = { title: "Sobre mí" };

export default function SobreMi() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <p className="eyebrow">Quién está del otro lado</p>
      <h1 className="mt-3 text-3xl">Sobre mí</h1>

      {/* TODO: reemplazar por el texto real antes de publicar. */}
      <div className="mt-8 space-y-5 leading-relaxed text-noche/80">
        <p>
          SientoLuz nació en pandemia, cuando muchas de nosotras necesitábamos algo a
          lo que agarrarnos. Empezó como talleres sueltos por WhatsApp y terminó siendo
          una comunidad.
        </p>
        <p>
          Hoy vuelve con los mismos contenidos, revisados y ampliados, y con una idea
          que no cambió: esto no es magia, es trabajo. Yo te acompaño, pero lo hacés vos.
        </p>
      </div>

      <p className="ritual mt-10">
        Tu fecha de nacimiento guarda un mapa: aprendamos a leerlo juntas.
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
