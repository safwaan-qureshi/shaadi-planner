-- ============================================================
-- SHAADI PLANNER — COMPLETE DATABASE SCHEMA
-- Paste this entire file into Supabase SQL Editor and click Run
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Settings ─────────────────────────────────────────────────
create table if not exists settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz default now()
);
insert into settings (key, value) values
  ('wedding_budget', '5000000'),
  ('wedding_date',   '2025-09-14'),
  ('wedding_title',  'Aisha & Hamza')
on conflict (key) do nothing;

-- ── Events ───────────────────────────────────────────────────
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  date        date,
  location    text,
  notes       text,
  guest_count integer default 0,
  schedule    text,
  status      text default 'upcoming',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Vendors ──────────────────────────────────────────────────
create table if not exists vendors (
  id                     uuid primary key default uuid_generate_v4(),
  name                   text not null,
  category               text not null,
  contact_name           text,
  contact_phone          text,
  contact_email          text,
  cost                   numeric(12,2) default 0,
  deposit_amount         numeric(12,2) default 0,
  deposit_due_date       date,
  final_payment_due_date date,
  status                 text default 'vendor_selected',
  notes                  text,
  event_id               uuid references events(id) on delete set null,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ── Guests ───────────────────────────────────────────────────
create table if not exists guests (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  phone                text,
  email                text,
  side                 text default 'bride',
  rsvp_status          text default 'pending',
  events_invited       text[] default '{}',
  events_confirmed     text[] default '{}',
  transport_needed     boolean default false,
  accommodation_needed boolean default false,
  notes                text,
  invite_token         text unique default gen_random_uuid()::text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ── Family Members ───────────────────────────────────────────
create table if not exists family_members (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  role       text not null,
  email      text,
  phone      text,
  notes      text,
  created_at timestamptz default now()
);

-- ── Tasks ────────────────────────────────────────────────────
create table if not exists tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  assigned_to text,
  deadline    date,
  status      text default 'todo',
  priority    text default 'medium',
  event_id    uuid references events(id) on delete set null,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Expenses ─────────────────────────────────────────────────
create table if not exists expenses (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  amount     numeric(12,2) not null default 0,
  category   text,
  paid       boolean default false,
  notes      text,
  event_id   uuid references events(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Responsibilities ─────────────────────────────────────────
create table if not exists responsibilities (
  id                     uuid primary key default uuid_generate_v4(),
  event_id               uuid references events(id) on delete cascade,
  name                   text not null,
  assigned_to            text,
  payment_responsibility text default 'bride',
  notes                  text,
  created_at             timestamptz default now()
);

-- ── Outfits ──────────────────────────────────────────────────
create table if not exists outfits (
  id                     uuid primary key default uuid_generate_v4(),
  person_name            text not null,
  person_role            text not null,
  event_id               uuid references events(id) on delete set null,
  outfit_type            text not null,
  designer               text,
  cost                   numeric(12,2) default 0,
  payment_responsibility text default 'individual',
  status                 text default 'shortlisted',
  notes                  text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ── Gifts ────────────────────────────────────────────────────
create table if not exists gifts (
  id              uuid primary key default uuid_generate_v4(),
  guest_id        uuid references guests(id) on delete set null,
  gift_type       text not null,
  description     text,
  estimated_value numeric(12,2) default 0,
  notes           text,
  created_at      timestamptz default now()
);

-- ── Moodboard ────────────────────────────────────────────────
create table if not exists moodboard (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid references events(id) on delete cascade,
  url        text not null,
  caption    text,
  created_at timestamptz default now()
);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger t_events      before update on events      for each row execute function update_updated_at();
create trigger t_vendors     before update on vendors     for each row execute function update_updated_at();
create trigger t_guests      before update on guests      for each row execute function update_updated_at();
create trigger t_tasks       before update on tasks       for each row execute function update_updated_at();
create trigger t_expenses    before update on expenses    for each row execute function update_updated_at();
create trigger t_outfits     before update on outfits     for each row execute function update_updated_at();

-- ── Row Level Security (open for MVP) ────────────────────────
alter table settings        enable row level security;
alter table events          enable row level security;
alter table vendors         enable row level security;
alter table guests          enable row level security;
alter table family_members  enable row level security;
alter table tasks           enable row level security;
alter table expenses        enable row level security;
alter table responsibilities enable row level security;
alter table outfits         enable row level security;
alter table gifts           enable row level security;
alter table moodboard       enable row level security;

-- Allow all reads and writes (no login required for MVP)
create policy "public_all" on settings        for all using (true) with check (true);
create policy "public_all" on events          for all using (true) with check (true);
create policy "public_all" on vendors         for all using (true) with check (true);
create policy "public_all" on guests          for all using (true) with check (true);
create policy "public_all" on family_members  for all using (true) with check (true);
create policy "public_all" on tasks           for all using (true) with check (true);
create policy "public_all" on expenses        for all using (true) with check (true);
create policy "public_all" on responsibilities for all using (true) with check (true);
create policy "public_all" on outfits         for all using (true) with check (true);
create policy "public_all" on gifts           for all using (true) with check (true);
create policy "public_all" on moodboard       for all using (true) with check (true);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists guests_invite_token_idx on guests(invite_token);
create index if not exists tasks_event_idx         on tasks(event_id);
create index if not exists vendors_event_idx       on vendors(event_id);
create index if not exists expenses_event_idx      on expenses(event_id);

