-- ============================================================
-- GLOBAL FAMILY WEDDING HUB — SQL MIGRATION
-- Run each block separately in Supabase SQL Editor
-- ============================================================

-- Block 1: Travel Plans table
create table if not exists travel_plans (
  id                   uuid primary key default uuid_generate_v4(),
  guest_id             uuid references guests(id) on delete set null,
  guest_name           text,
  arrival_date         date,
  departure_date       date,
  airline              text,
  flight_number        text,
  arrival_city         text,
  hotel_name           text,
  needs_airport_pickup boolean default false,
  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table travel_plans enable row level security;
create policy "public_all" on travel_plans for all using (true) with check (true);
create trigger t_travel before update on travel_plans for each row execute function update_updated_at();

-- Block 2: Wedding Updates feed table
create table if not exists wedding_updates (
  id         uuid primary key default uuid_generate_v4(),
  type       text,
  message    text not null,
  emoji      text default '📌',
  created_at timestamptz default now()
);

alter table wedding_updates enable row level security;
create policy "public_all" on wedding_updates for all using (true) with check (true);
