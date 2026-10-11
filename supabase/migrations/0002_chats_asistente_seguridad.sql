-- Lunaure: chats con racha, asistente Aura y registro de seguridad.
-- Mismas reglas que 0001: RLS en todas las tablas, cada persona solo ve lo suyo.

-- ===================================================================
-- CHATS (directos y de grupo)
-- ===================================================================
create table public.chats (
  id      uuid primary key default gen_random_uuid(),
  tipo    text not null check (tipo in ('directo', 'grupo')),
  nombre  text check (char_length(nombre) <= 60),
  creador uuid not null references public.perfiles(id) on delete cascade,
  creado  timestamptz not null default now()
);

create table public.chat_miembros (
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references public.perfiles(id) on delete cascade,
  unido   timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create table public.mensajes (
  id      uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  autor   uuid not null references public.perfiles(id) on delete cascade,
  texto   text check (char_length(texto) <= 2000),
  rachi   boolean not null default false,   -- mensaje "Enviar a Rachi"
  creado  timestamptz not null default now(),
  check (texto is not null or rachi)
);
create index on public.mensajes (chat_id, creado desc);

alter table public.chats         enable row level security;
alter table public.chat_miembros enable row level security;
alter table public.mensajes      enable row level security;

-- security definer para no entrar en bucle con la política de chat_miembros
create or replace function public.en_chat(c uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.chat_miembros m where m.chat_id = c and m.user_id = auth.uid())
$$;

create policy "veo mis chats" on public.chats for select using (public.en_chat(id));
create policy "creo chats" on public.chats for insert with check (auth.uid() = creador);
create policy "creador renombra" on public.chats for update using (auth.uid() = creador);

create policy "veo miembros de mis chats" on public.chat_miembros for select using (public.en_chat(chat_id));
-- Solo el creador añade gente, y nunca a alguien que le ha bloqueado
create policy "creador añade miembros" on public.chat_miembros for insert with check (
  exists (select 1 from public.chats c where c.id = chat_id and c.creador = auth.uid())
  and not exists (select 1 from public.bloqueos b where b.user_id = chat_miembros.user_id and b.bloqueado = auth.uid())
);
create policy "salgo del chat" on public.chat_miembros for delete using (auth.uid() = user_id);

create policy "leo mensajes de mis chats" on public.mensajes for select using (public.en_chat(chat_id));
create policy "escribo en mis chats" on public.mensajes for insert with check (auth.uid() = autor and public.en_chat(chat_id));
create policy "borro mis mensajes" on public.mensajes for delete using (auth.uid() = autor);

-- Racha: días seguidos en los que han escrito ambos (directo) o la mitad del grupo (mínimo 3)
create or replace function public.racha_chat(c uuid) returns integer
language sql stable security invoker set search_path = '' as $$
  with dias as (
    select (m.creado at time zone 'Europe/Madrid')::date d, count(distinct m.autor) n
    from public.mensajes m where m.chat_id = c group by 1
  ), umbral as (
    select case when ch.tipo = 'directo' then 2
                else greatest(3, ceil((select count(*) from public.chat_miembros cm where cm.chat_id = c) / 2.0)) end u
    from public.chats ch where ch.id = c
  ), validos as (
    select d, d - (row_number() over (order by d))::int grp from dias, umbral where n >= u
  )
  select coalesce(max(cnt), 0)::int from (
    select grp, count(*) cnt, max(d) ultimo from validos group by grp
  ) s where ultimo >= (now() at time zone 'Europe/Madrid')::date - 1
$$;

-- ===================================================================
-- ASISTENTE AURA (IA). Las respuestas las genera una Edge Function
-- con la clave de la API guardada como secreto en el servidor.
-- ===================================================================
create table privado.asistente_mensajes (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rol     text not null check (rol in ('yo', 'aura')),
  texto   text not null check (char_length(texto) <= 4000),
  creado  timestamptz not null default now()
);
alter table privado.asistente_mensajes enable row level security;
create policy "leo mi asistente" on privado.asistente_mensajes for select using (auth.uid() = user_id);
create policy "pregunto" on privado.asistente_mensajes for insert with check (auth.uid() = user_id and rol = 'yo');
create policy "borro mi historial" on privado.asistente_mensajes for delete using (auth.uid() = user_id);
grant select, insert, delete on privado.asistente_mensajes to authenticated;

-- ===================================================================
-- SEGURIDAD DE LA CUENTA
-- ===================================================================
create table privado.actividad_seguridad (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references auth.users(id) on delete cascade,
  evento    text not null,             -- inicio_sesion, 2fa_activada, sesion_cerrada...
  dispositivo text,
  ip_aprox  inet,                      -- se guarda truncada (/24) para minimizar datos
  creado    timestamptz not null default now()
);
alter table privado.actividad_seguridad enable row level security;
create policy "veo mi actividad" on privado.actividad_seguridad for select using (auth.uid() = user_id);
grant select on privado.actividad_seguridad to authenticated;
-- Solo el servidor (service role) escribe aquí; el usuario no puede falsificar su historial.

-- Retención: 30 días para el asistente y 12 meses para la actividad de seguridad
create or replace function privado.purgar_registros() returns void
language sql security definer set search_path = '' as $$
  delete from privado.asistente_mensajes where creado < now() - interval '30 days';
  delete from privado.actividad_seguridad where creado < now() - interval '12 months';
$$;
-- select cron.schedule('purgar-registros', '30 3 * * *', 'select privado.purgar_registros()');
