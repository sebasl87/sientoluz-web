import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/cursos", texto: "Cursos" },
  { href: "/cursos#kits", texto: "Kits" },
  { href: "/sobre-mi", texto: "Sobre mí" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-lavanda/60 bg-crema/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="SientoLuz · inicio">
          <Image
            src="/marca/logo-horizontal-color.png"
            alt="SientoLuz"
            width={392}
            height={126}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-titulo text-xs tracking-[0.2em] uppercase text-noche/70 transition-colors hover:text-amatista"
            >
              {l.texto}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
