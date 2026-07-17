import Link from "next/link";
import Separador from "./Separador";

export default function Footer() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <footer className="mt-24 bg-noche px-5 py-14 text-crema/80">
      <div className="mx-auto max-w-6xl">
        <p className="ritual max-w-xl text-lavanda">
          Hoy es un gran día para soltar lo que ya cumplió su ciclo.
        </p>
        <Separador className="my-8 opacity-40" />
        <div className="flex flex-col justify-between gap-8 text-sm sm:flex-row">
          <p className="max-w-sm leading-relaxed">
            SientoLuz acompaña procesos de transformación personal a través de la
            numerología, la energía y los rituales.
          </p>
          <nav className="flex flex-col gap-2">
            <Link href="/cursos" className="hover:text-jade">Cursos</Link>
            <Link href="/sobre-mi" className="hover:text-jade">Sobre mí</Link>
            <a href="https://instagram.com/sientoluz" className="hover:text-jade">Instagram</a>
            <a href="https://facebook.com/sientoluz" className="hover:text-jade">Facebook</a>
          </nav>
          <div className="flex flex-col gap-2">
            <a href="mailto:hola@sientoluz.com" className="hover:text-jade">
              hola@sientoluz.com
            </a>
            {wa && (
              <a href={`https://wa.me/${wa}`} className="hover:text-jade">
                WhatsApp
              </a>
            )}
          </div>
          <div className="flex flex-col gap-2 text-crema/50">
            <Link href="/terminos" className="hover:text-jade">Términos y reintegros</Link>
            <Link href="/privacidad" className="hover:text-jade">Privacidad</Link>
            <p>© {new Date().getFullYear()} SientoLuz</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
