import { supabasePublico } from "./supabase";
import type { Curso, Kit } from "./tipos";

const SELECT_KIT = `
  id, slug, nombre, bajada, descripcion, precio_ars, precio_ancla_ars, destacado, orden,
  kit_cursos ( orden, cursos ( slug, nombre, bajada, precio_ars ) )
`;

type FilaKit = Omit<Kit, "cursos"> & {
  kit_cursos: { orden: number; cursos: Kit["cursos"][number] }[];
};

function armarKit(fila: FilaKit): Kit {
  const { kit_cursos, ...resto } = fila;
  return {
    ...resto,
    cursos: [...kit_cursos].sort((a, b) => a.orden - b.orden).map((k) => k.cursos),
  };
}

export async function listarCursos(): Promise<Curso[]> {
  const { data, error } = await supabasePublico()
    .from("cursos")
    .select("*")
    .eq("activo", true)
    .order("orden");
  if (error) throw error;
  return data as Curso[];
}

export async function listarKits(): Promise<Kit[]> {
  const { data, error } = await supabasePublico()
    .from("kits")
    .select(SELECT_KIT)
    .eq("activo", true)
    .order("orden");
  if (error) throw error;
  return (data as unknown as FilaKit[]).map(armarKit);
}

export async function traerCurso(slug: string): Promise<Curso | null> {
  const { data } = await supabasePublico()
    .from("cursos")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  return (data as Curso) ?? null;
}

export async function traerKit(slug: string): Promise<Kit | null> {
  const { data } = await supabasePublico()
    .from("kits")
    .select(SELECT_KIT)
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  return data ? armarKit(data as unknown as FilaKit) : null;
}

/** Kits que incluyen este curso — alimentan el upsell de la ficha. */
export async function kitsQueIncluyen(slug: string): Promise<Kit[]> {
  const kits = await listarKits();
  return kits.filter((k) => k.cursos.some((c) => c.slug === slug));
}
