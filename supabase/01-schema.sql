-- SientoLuz · esquema base
-- Ejecutar en Supabase → SQL Editor (una sola vez).

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Tipos
-- ─────────────────────────────────────────────────────────────
do $$ begin
  create type estado_orden as enum ('pendiente', 'pagado', 'entregado', 'cancelado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type metodo_pago as enum ('mercadopago', 'transferencia');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────
-- Catálogo
-- ─────────────────────────────────────────────────────────────
create table if not exists cursos (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  nombre           text not null,
  bajada           text not null,              -- una línea, para tarjetas
  descripcion      text not null,              -- párrafo de la ficha
  aprendes         text[] not null default '{}',
  dirigido_a       text,
  temario          text[] not null default '{}',
  precio_ars       integer not null,
  precio_ancla_ars integer,                    -- precio tachado; null = sin ancla
  paginas          integer,
  archivo          text not null,              -- ruta dentro del bucket privado 'cursos'
  destacado        boolean not null default false,
  solo_en_kit      boolean not null default false,  -- no se vende suelto (Meditación)
  orden            integer not null default 0,
  activo           boolean not null default true,
  creado_en        timestamptz not null default now()
);

create table if not exists kits (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  nombre           text not null,
  bajada           text not null,
  descripcion      text not null,
  precio_ars       integer not null,
  precio_ancla_ars integer,
  destacado        boolean not null default false,
  orden            integer not null default 0,
  activo           boolean not null default true,
  creado_en        timestamptz not null default now()
);

create table if not exists kit_cursos (
  kit_id   uuid not null references kits(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  orden    integer not null default 0,
  primary key (kit_id, curso_id)
);

-- ─────────────────────────────────────────────────────────────
-- Ventas
-- ─────────────────────────────────────────────────────────────
create table if not exists clientes (
  id        uuid primary key default gen_random_uuid(),
  email     text unique not null,
  nombre    text not null,
  telefono  text,
  acepta_novedades boolean not null default false,
  creado_en timestamptz not null default now()
);

create sequence if not exists orden_numero_seq start 1001;

create table if not exists ordenes (
  id                uuid primary key default gen_random_uuid(),
  numero            text unique not null default 'SL-' || to_char(now(), 'YY') || '-' || nextval('orden_numero_seq'),
  cliente_id        uuid not null references clientes(id),
  metodo            metodo_pago not null,
  estado            estado_orden not null default 'pendiente',
  total_ars         integer not null,
  mp_preference_id  text,
  mp_payment_id     text,
  comprobante_url   text,                      -- transferencia: comprobante subido
  notas             text,
  creado_en         timestamptz not null default now(),
  pagado_en         timestamptz,
  entregado_en      timestamptz
);

create index if not exists ordenes_estado_idx on ordenes (estado, creado_en desc);
create index if not exists ordenes_mp_pref_idx on ordenes (mp_preference_id);

create table if not exists orden_items (
  id         uuid primary key default gen_random_uuid(),
  orden_id   uuid not null references ordenes(id) on delete cascade,
  curso_id   uuid references cursos(id),
  kit_id     uuid references kits(id),
  nombre     text not null,                    -- snapshot: el nombre al momento de comprar
  precio_ars integer not null,                 -- snapshot: el precio al momento de comprar
  constraint item_es_curso_o_kit check (num_nonnulls(curso_id, kit_id) = 1)
);

-- Entregas: una fila por archivo enviado. La escribe n8n.
create table if not exists entregas (
  id          uuid primary key default gen_random_uuid(),
  orden_id    uuid not null references ordenes(id) on delete cascade,
  curso_id    uuid not null references cursos(id),
  archivo     text not null,                   -- ruta del PDF ya marcado al agua
  enviado_en  timestamptz not null default now(),
  descargas   integer not null default 0
);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- El catálogo se lee público. Todo lo demás solo con service_role
-- (la web usa service_role del lado del servidor; n8n usa la suya).
-- ─────────────────────────────────────────────────────────────
alter table cursos      enable row level security;
alter table kits        enable row level security;
alter table kit_cursos  enable row level security;
alter table clientes    enable row level security;
alter table ordenes     enable row level security;
alter table orden_items enable row level security;
alter table entregas    enable row level security;

drop policy if exists "catálogo público: cursos" on cursos;
create policy "catálogo público: cursos" on cursos
  for select using (activo = true);

drop policy if exists "catálogo público: kits" on kits;
create policy "catálogo público: kits" on kits
  for select using (activo = true);

drop policy if exists "catálogo público: kit_cursos" on kit_cursos;
create policy "catálogo público: kit_cursos" on kit_cursos
  for select using (true);

-- clientes, ordenes, orden_items y entregas quedan sin policy:
-- inaccesibles con la anon key, accesibles con service_role.

-- ─────────────────────────────────────────────────────────────
-- Storage
-- ─────────────────────────────────────────────────────────────
-- Bucket privado con los PDFs maestros. Los links de descarga se firman
-- desde el servidor (createSignedUrl) con vencimiento.
insert into storage.buckets (id, name, public)
values ('cursos', 'cursos', false)
on conflict (id) do nothing;

-- Bucket privado donde n8n deja el PDF ya marcado al agua por comprador.
insert into storage.buckets (id, name, public)
values ('entregas', 'entregas', false)
on conflict (id) do nothing;

-- Bucket privado para los comprobantes de transferencia que suben los clientes.
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;
