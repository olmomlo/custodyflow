-- =====================================================================
-- ESQUEMA SUPABASE - APP DE CUSTODIA COMPARTIDA
-- =====================================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase.
-- (Dashboard de Supabase → SQL Editor → New query → pegar → Run)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabla principal: estado de cada día del calendario
-- ---------------------------------------------------------------------
create table if not exists public.dias (
  fecha date primary key,
  custodia text check (custodia in ('padre', 'madre')),
  festivo boolean not null default false,
  no_lectivo boolean not null default false,
  comentario text,
  updated_at timestamptz not null default now(),
  updated_by text check (updated_by in ('padre', 'madre'))
);

create index if not exists idx_dias_fecha on public.dias (fecha);

-- ---------------------------------------------------------------------
-- Tabla de historial de cambios
-- ---------------------------------------------------------------------
create table if not exists public.historial (
  id bigserial primary key,
  fecha date not null,
  campo text not null check (campo in ('custodia', 'festivo', 'no_lectivo', 'comentario')),
  valor_anterior text,
  valor_nuevo text,
  autor text not null check (autor in ('padre', 'madre')),
  created_at timestamptz not null default now()
);

create index if not exists idx_historial_created_at on public.historial (created_at desc);
create index if not exists idx_historial_fecha on public.historial (fecha);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- Como la app no usa login, las políticas son públicas. Cualquier persona
-- con la URL de tu app y la anon key podrá leer y escribir.
-- Si quieres restringirlo, puedes añadir más adelante autenticación.
-- ---------------------------------------------------------------------

alter table public.dias enable row level security;
alter table public.historial enable row level security;

drop policy if exists "Lectura pública dias" on public.dias;
drop policy if exists "Inserción pública dias" on public.dias;
drop policy if exists "Actualización pública dias" on public.dias;
drop policy if exists "Borrado público dias" on public.dias;
drop policy if exists "Lectura pública historial" on public.historial;
drop policy if exists "Inserción pública historial" on public.historial;

create policy "Lectura pública dias"
  on public.dias for select using (true);

create policy "Inserción pública dias"
  on public.dias for insert with check (true);

create policy "Actualización pública dias"
  on public.dias for update using (true) with check (true);

create policy "Borrado público dias"
  on public.dias for delete using (true);

create policy "Lectura pública historial"
  on public.historial for select using (true);

create policy "Inserción pública historial"
  on public.historial for insert with check (true);

-- ---------------------------------------------------------------------
-- Limpieza automática del historial: borra registros > 2 meses
-- ---------------------------------------------------------------------
create or replace function public.limpiar_historial_antiguo()
returns void
language sql
as $$
  delete from public.historial
  where created_at < now() - interval '2 months';
$$;

-- ---------------------------------------------------------------------
-- Realtime: permite que ambos progenitores vean cambios al instante
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'dias'
  ) then
    alter publication supabase_realtime add table public.dias;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'historial'
  ) then
    alter publication supabase_realtime add table public.historial;
  end if;
end $$;
