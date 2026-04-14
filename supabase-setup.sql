-- MusicRight.AI — Supabase Schema Setup
-- Run this in: supabase.com → supabase-aqua-field project → SQL Editor → New query → Run

-- ─── 1. Song Registrations (mobile app → Register tab) ────────────────────────
create table if not exists public.song_registrations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  title        text not null,
  artist_name  text not null,
  genre        text,
  isrc         text,
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);
alter table public.song_registrations enable row level security;
create policy "Users can read own songs"
  on public.song_registrations for select using (auth.uid() = user_id);
create policy "Users can insert own songs"
  on public.song_registrations for insert with check (auth.uid() = user_id);

-- ─── 2. Audit Requests (web app → /intake → $149 product) ─────────────────────
create table if not exists public.audit_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  stage_name   text,
  distributor  text,
  pros         text[] default '{}',
  song_count   text,
  top_song     text,
  notes        text,
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);
alter table public.audit_requests enable row level security;
create policy "Service role full access"
  on public.audit_requests for all using (auth.role() = 'service_role');
