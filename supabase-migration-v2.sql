-- ============================================================
-- SHAADI PLANNER v2 — SUPABASE MIGRATION
-- Run this in your Supabase SQL Editor AFTER the original schema
-- ============================================================

-- ── 1. Modify guests table ────────────────────────────────────
alter table guests
  add column if not exists side                text default 'bride' check (side in ('bride','groom')),
  add column if not exists events_invited      text[] default '{}',
  add column if not exists events_confirmed    text[] default '{}',
  add column if not exists transport_needed    boolean default false,
  add column if not exists accommodation_needed boolean default false,
  add column if not exists invite_token        text unique default gen_random_uuid()::text;

-- ── 2. Modify vendors table ───────────────────────────────────
alter table vendors
  rename column price to cost;

alter table vendors
  add column if not exists deposit_due_date        date,
  add column if not exists final_payment_due_date  date;

alter table vendors drop constraint if exists vendors_status_check;
alter table vendors
  add constraint vendors_status_check
  check (status in ('vendor_selected','deposit_due','deposit_paid','final_payment_due','completed'));

-- ── 3. Create event_responsibilities table ───────────────────
create table if not exists event_responsibilities (
  id                     uuid primary key default uuid_generate_v4(),
  event_id               uuid references events(id) on delete cascade,
  name                   text not null,
  assigned_to            text,
  payment_responsibility text not null check (payment_responsibility in ('bride','groom','shared')),
  notes                  text,
  created_at             timestamptz default now()
);

-- ── 4. Create outfits table ───────────────────────────────────
create table if not exists outfits (
  id                     uuid primary key default uuid_generate_v4(),
  person_name            text not null,
  person_role            text not null check (person_role in ('bride','groom','family')),
  event_id               uuid references events(id) on delete set null,
  outfit_type            text not null,
  designer               text,
  cost                   numeric(12,2) default 0,
  payment_responsibility text default 'individual' check (payment_responsibility in ('bride','groom','individual','shared')),
  status                 text default 'shortlisted' check (status in ('shortlisted','ordered','tailoring_in_progress','ready_for_fitting','completed')),
  notes                  text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ── 5. Create gifts table ─────────────────────────────────────
create table if not exists gifts (
  id              uuid primary key default uuid_generate_v4(),
  guest_id        uuid references guests(id) on delete set null,
  gift_type       text not null check (gift_type in ('cash_envelope','jewelry','physical_gift')),
  description     text,
  estimated_value numeric(12,2) default 0,
  notes           text,
  created_at      timestamptz default now()
);

-- ── 6. Create event_moodboards table ─────────────────────────
create table if not exists event_moodboards (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid references events(id) on delete cascade,
  url        text not null,
  caption    text,
  created_at timestamptz default now()
);

-- ── 7. Updated_at triggers for new tables ────────────────────
create trigger outfits_updated_at
  before update on outfits
  for each row execute function update_updated_at();

-- ── 8. RLS policies for new tables ───────────────────────────
alter table event_responsibilities enable row level security;
alter table outfits                enable row level security;
alter table gifts                  enable row level security;
alter table event_moodboards       enable row level security;

create policy "Allow all" on event_responsibilities for all using (true) with check (true);
create policy "Allow all" on outfits               for all using (true) with check (true);
create policy "Allow all" on gifts                 for all using (true) with check (true);
create policy "Allow all" on event_moodboards      for all using (true) with check (true);

-- ── 9. Index for fast invite token lookup ────────────────────
create index if not exists guests_invite_token_idx on guests(invite_token);
