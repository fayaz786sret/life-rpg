-- ============================================================
-- Life RPG — Supabase Database Schema  (run in SQL Editor)
-- ============================================================

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  username             text not null default 'Hero',
  total_xp             integer not null default 0,
  level                integer not null default 1,
  gold                 integer not null default 100,
  streak               integer not null default 0,
  last_completion_date timestamptz,
  tasks_completed      integer not null default 0,
  active_theme         text    not null default 'midnight',
  active_avatar        text    not null default '⚔️',
  active_badge         text,
  updated_at           timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

-- Backfill columns for existing projects that were created before cosmetic loadout fields
alter table public.profiles add column if not exists active_theme text not null default 'midnight';
alter table public.profiles add column if not exists active_avatar text not null default '⚔️';
alter table public.profiles add column if not exists active_badge text;

-- Auto-create profile row on sign-up (hardened against missing metadata)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _username text;
begin
  _username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'Hero'
  );
  -- Only insert if not already exists (idempotent)
  insert into public.profiles (id, username)
  values (new.id, _username)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. ATTRIBUTES
-- ─────────────────────────────────────────────
create table if not exists public.attributes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  physical   integer not null default 1,
  mental     integer not null default 1,
  creative   integer not null default 1,
  social     integer not null default 1,
  health     integer not null default 1,
  skill      integer not null default 1,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Auto-create attributes row when profile is created
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.attributes (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();

-- ─────────────────────────────────────────────
-- 3. TASKS
-- ─────────────────────────────────────────────
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 100),
  description  text check (char_length(description) <= 300),
  difficulty   text not null default 'easy'
                 check (difficulty in ('trivial','easy','medium','hard','epic')),
  category     text not null default 'mental'
                 check (category in ('physical','mental','creative','social','health','skill')),
  completed    boolean not null default false,
  completed_at timestamptz,
  xp_earned    integer,
  gold_earned  integer,
  created_at   timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "Users can manage their own tasks" on public.tasks;
create policy "Users can manage their own tasks"
  on public.tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 4. INVENTORY
-- ─────────────────────────────────────────────
create table if not exists public.inventory (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  item_id      text not null,
  purchased_at timestamptz not null default now(),
  unique(user_id, item_id)
);

alter table public.inventory enable row level security;

drop policy if exists "Users can manage their own inventory" on public.inventory;
create policy "Users can manage their own inventory"
  on public.inventory for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 5. RLS — profiles & attributes
-- ─────────────────────────────────────────────
alter table public.profiles   enable row level security;
alter table public.attributes enable row level security;

drop policy if exists "Users can view and update their own profile"    on public.profiles;
drop policy if exists "Users can view and update their own attributes" on public.attributes;

create policy "Users can view and update their own profile"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can view and update their own attributes"
  on public.attributes for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 6. INDEXES
-- ─────────────────────────────────────────────
create index if not exists tasks_user_id_idx      on public.tasks(user_id);
create index if not exists tasks_completed_idx    on public.tasks(user_id, completed);
create index if not exists inventory_user_id_idx  on public.inventory(user_id);
create index if not exists attributes_user_id_idx on public.attributes(user_id);
create index if not exists profiles_username_idx   on public.profiles(username);
