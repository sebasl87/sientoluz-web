import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // ⚠️ Los .ttf se leen del disco en runtime (estampar.ts, certificado.ts).
  // Next.js rastrea imports, no fs.readFile: sin esto las fuentes NO entran
  // en el bundle de la función y la entrega muere con ENOENT en producción.
  // Es la trampa más fácil de no ver, porque en local anda perfecto.
  outputFileTracingIncludes: {
    "/api/**": ["./src/fuentes/**"],
    "/admin/**": ["./src/fuentes/**"],
  },
};

export default nextConfig;
