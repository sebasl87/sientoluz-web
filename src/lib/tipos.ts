export type Curso = {
  id: string;
  slug: string;
  nombre: string;
  bajada: string;
  descripcion: string;
  aprendes: string[];
  dirigido_a: string | null;
  temario: string[];
  precio_ars: number;
  precio_ancla_ars: number | null;
  paginas: number | null;
  archivo: string;
  destacado: boolean;
  solo_en_kit: boolean;
  orden: number;
};

export type Kit = {
  id: string;
  slug: string;
  nombre: string;
  bajada: string;
  descripcion: string;
  precio_ars: number;
  precio_ancla_ars: number | null;
  destacado: boolean;
  orden: number;
  cursos: Pick<Curso, "slug" | "nombre" | "bajada" | "precio_ars">[];
};

export type ItemCarrito = { tipo: "curso" | "kit"; slug: string };
