create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  usuario text not null unique,
  senha text not null,
  tipo text not null check (tipo in ('admin', 'membro')),
  data_criacao timestamptz not null default now()
);

create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  usuario uuid not null references public.usuarios(id) on delete cascade,
  farm text not null,
  materiais integer not null default 200,
  dinheiro numeric(12, 2) not null default 0,
  restantes integer not null default 0,
  print text not null,
  data timestamptz not null default now(),
  status text not null default 'Entregue'
);

alter table public.usuarios enable row level security;
alter table public.registros enable row level security;

drop policy if exists "usuarios_select_all" on public.usuarios;
drop policy if exists "usuarios_insert_all" on public.usuarios;
drop policy if exists "usuarios_update_all" on public.usuarios;
drop policy if exists "usuarios_delete_all" on public.usuarios;
drop policy if exists "registros_select_all" on public.registros;
drop policy if exists "registros_insert_all" on public.registros;
drop policy if exists "registros_update_all" on public.registros;
drop policy if exists "registros_delete_all" on public.registros;

create policy "usuarios_select_all"
on public.usuarios for select
to anon
using (true);

create policy "usuarios_insert_all"
on public.usuarios for insert
to anon
with check (true);

create policy "usuarios_update_all"
on public.usuarios for update
to anon
using (true)
with check (true);

create policy "usuarios_delete_all"
on public.usuarios for delete
to anon
using (true);

create policy "registros_select_all"
on public.registros for select
to anon
using (true);

create policy "registros_insert_all"
on public.registros for insert
to anon
with check (true);

create policy "registros_update_all"
on public.registros for update
to anon
using (true)
with check (true);

create policy "registros_delete_all"
on public.registros for delete
to anon
using (true);

create index if not exists idx_registros_usuario on public.registros(usuario);
create index if not exists idx_registros_data on public.registros(data desc);

insert into public.usuarios (nome, usuario, senha, tipo)
select 'Administrador', 'admin', '123456', 'admin'
where not exists (
  select 1 from public.usuarios where usuario = 'admin'
);
