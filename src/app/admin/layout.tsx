import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Panel · SientoLuz",
  robots: { index: false, follow: false },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "SientoLuz", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#2E2645",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** El panel no lleva el Header ni el Footer del sitio: es otra cosa. */
export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
