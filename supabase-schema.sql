-- ============================================================
-- SHAADI PLANNER — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to create all tables
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Events ───────────────────────────────────────────────────
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  date        date,
  location    text,
  notes       text,
  guest_count integer default 0,
  schedule    text,
  status      text default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Vendors ──────────────────────────────────────────────────
create table if not exists vendors (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  category      text not null check (category in ('venue','decorator','photographer','caterer','makeup_artist','transportation','entertainment','other')),
  contact_name  text,
  contact_phone text,
  contact_email text,
  price         numeric(12,2) default 0,
  deposit       numeric(12,2) default 0,
  status        text default 'pending' check (status in ('pending','confirmed','negotiating','cancelled')),
  notes         text,
  event_id      uuid references events(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Guests ───────────────────────────────────────────────────
create table if not exists guests (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  phone       text,
  email       text,
  rsvp_status text default 'pending' check (rsvp_status in ('pending','confirmed','declined')),
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Guest <> Event junction table ────────────────────────────
create table if not exists guest_events (
  guest_id  uuid references guests(id) on delete cascade,
  event_id  uuid references events(id) on delete cascade,
  primary key (guest_id, event_id)
);

-- ── Family Members ───────────────────────────────────────────
create table if not exists family_members (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  role       text not null check (role in ('bride','groom','planner','family_coordinator','finance_manager','family')),
  email      text,
  phone      text,
  notes      text,
  created_at timestamptz default now()
);

-- ── Tasks ────────────────────────────────────────────────────
create table if not exists tasks (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  assigned_to     text,
  assigned_member uuid references family_members(id) on delete set null,
  deadline        date,
  status          text default 'todo' check (status in ('todo','in_progress','done')),
  priority        text default 'medium' check (priority in ('high','medium','low')),
  event_id        uuid references events(id) on delete set null,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Expenses ─────────────────────────────────────────────────
create table if not exists expenses (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  amount     numeric(12,2) not null default 0,
  category   text check (category in ('venue','catering','photography','clothing','beauty','decor','stationery','travel','entertainment','other')),
  paid       boolean default false,
  notes      text,
  event_id   uuid references events(id) on delete set null,
  vendor_id  uuid references vendors(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Settings (budget, wedding date, etc.) ────────────────────
create table if not exists settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz default now()
);

-- Insert defaults
insert into settings (key, value) values
  ('wedding_budget', '5000000'),
  ('wedding_date', '2025-03-14'),
  ('wedding_title', 'Aisha & Hamza')
on conflict (key) do nothing;

-- ── Updated_at triggers ──────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at    before update on events    for each row execute function update_updated_at();
create trigger vendors_updated_at   before update on vendors   for each row execute function update_updated_at();
create trigger guests_updated_at    before update on guests    for each row execute function update_updated_at();
create trigger tasks_updated_at     before update on tasks     for each row execute function update_updated_at();
create trigger expenses_updated_at  before update on expenses  for each row execute function update_updated_at();

-- ── Row Level Security (RLS) ─────────────────────────────────
-- Enable RLS on all tables
alter table events          enable row level security;
alter table vendors         enable row level security;
alter table guests          enable row level security;
alter table guest_events    enable row level security;
alter table family_members  enable row level security;
alter table tasks           enable row level security;
alter table expenses        enable row level security;
alter table settings        enable row level security;

-- For MVP: allow all authenticated users to read/write everything
-- (tighten these policies per user in production)
create policy "Allow all for authenticated" on events          for all using (true) with check (true);
create policy "Allow all for authenticated" on vendors         for all using (true) with check (true);
create policy "Allow all for authenticated" on guests          for all using (true) with check (true);
create policy "Allow all for authenticated" on guest_events    for all using (true) with check (true);
create policy "Allow all for authenticated" on family_members  for all using (true) with check (true);
create policy "Allow all for authenticated" on tasks           for all using (true) with check (true);
create policy "Allow all for authenticated" on expenses        for all using (true) with check (true);
create policy "Allow all for authenticated" on settings        for all using (true) with check (true);
