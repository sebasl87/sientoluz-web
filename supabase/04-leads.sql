-- ============================================================
-- SientoLuz · Tabla de leads de los ganchos gratuitos
-- Correlo en Supabase → SQL Editor.
-- ============================================================

create table if not exists public.leads_ganchos (
  id         bigint generated always as identity primary key,
  creado_en  timestamptz not null default now(),
  gancho     text not null check (gancho in ('camino','alma','talento','vibra','ambos')),
  numero     text not null,          -- número resultante, ej "9" o "9·4"
  nombre     text,
  usuario    text,                   -- @handle
  canal      text,                   -- facebook | instagram | grupo_fb | otro
  fecha_nac  date                    -- solo ganchos de fecha; puede ser null
);

create index if not exists leads_ganchos_creado_idx on public.leads_ganchos (creado_en desc);
create index if not exists leads_ganchos_gancho_idx on public.leads_ganchos (gancho);

-- RLS activado SIN políticas: nadie con anon/authenticated puede leer ni escribir.
-- La escritura ocurre solo desde tu route handler con la SERVICE ROLE key,
-- que saltea RLS. Las estadísticas las mirás desde Supabase Studio (owner).
alter table public.leads_ganchos enable row level security;


-- ============================================================
-- Queries útiles para decidir mejores publicaciones
-- ============================================================

-- 1) Volumen por día (últimos 30 días)
-- select date_trunc('day', creado_en)::date as dia, count(*)
-- from leads_ganchos
-- where creado_en > now() - interval '30 days'
-- group by 1 order by 1;

-- 2) Qué gancho trae más leads
-- select gancho, count(*) as leads
-- from leads_ganchos group by 1 order by 2 desc;

-- 3) Distribución de números (qué números abundan en tu audiencia
--    → temas de contenido que le van a resonar a la mayoría)
-- select gancho, numero, count(*)
-- from leads_ganchos group by 1,2 order by 1, 3 desc;

-- 4) Qué canal convierte más volumen
-- select canal, count(*) from leads_ganchos group by 1 order by 2 desc;