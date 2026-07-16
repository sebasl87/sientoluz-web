import type { Metadata } from "next";
import { Josefin_Sans, Nunito_Sans, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--fuente-josefin",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--fuente-nunito",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--fuente-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://sientoluz.com"),
  title: {
    default: "SientoLuz · Cursos de numerología, péndulo y energía",
    template: "%s · SientoLuz",
  },
  description:
    "Talleres para acompañar tu transformación: numerología, péndulo, limpieza energética, chakras y meditación. Descarga inmediata.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "SientoLuz",
    images: ["/marca/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${josefin.variable} ${nunito.variable} ${cormorant.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
