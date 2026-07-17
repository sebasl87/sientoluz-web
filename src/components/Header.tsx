import Link from "next/link";
import Espiral from "./Espiral";

const links = [
  { href: "/cursos", texto: "Cursos" },
  { href: "/cursos#kits", texto: "Kits" },
  { href: "/sobre-mi", texto: "Sobre mí" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-crema/10 bg-noche/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="SientoLuz · inicio" className="flex items-center gap-2.5">
          <Espiral variante="crema" grosor={9} className="h-9 w-9" />
          <span className="font-titulo text-base font-light tracking-[0.3em] text-crema">
            SIENTOLUZ
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-titulo text-xs tracking-[0.2em] uppercase text-crema/70 transition-colors hover:text-jade"
            >
              {l.texto}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
