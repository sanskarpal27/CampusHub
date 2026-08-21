-- ============================================================
-- CampusHub Database Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- Campus Exchange: Items Table
-- ============================================================
create table if not exists public.items (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  title         text not null,
  description   text,
  price         numeric(10, 2),              -- null = free / not for sale
  category      text not null,               -- e.g. 'Books', 'Electronics', 'Clothing'
  condition     text not null default 'Good', -- 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'
  status        text not null default 'available', -- 'available' | 'reserved' | 'sold'

  image_urls    text[] default '{}',
  location      text,                        -- campus location / dorm

  seller_id     uuid references auth.users(id) on delete cascade,
  seller_name   text,
  seller_email  text
);

-- Automatically bump updated_at on row updates
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger items_updated_at
  before update on public.items
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.items enable row level security;

-- Public read: anyone can browse listings
create policy "Public read access for items"
  on public.items for select
  using (true);

-- Authenticated users can insert their own listings
create policy "Authenticated users can insert items"
  on public.items for insert
  with check (auth.uid() = seller_id);

-- Sellers can update their own listings
create policy "Sellers can update their own items"
  on public.items for update
  using (auth.uid() = seller_id);

-- Sellers can delete their own listings
create policy "Sellers can delete their own items"
  on public.items for delete
  using (auth.uid() = seller_id);

-- ============================================================
-- Lost & Found: Reports Table
-- ============================================================
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  type          text not null,               -- 'lost' | 'found'
  title         text not null,
  description   text,
  category      text not null,               -- e.g. 'Electronics', 'Keys', 'ID Card', 'Bag'
  status        text not null default 'open', -- 'open' | 'resolved'

  date_occurred date,                        -- when the item was lost / found
  location      text,                        -- where it was lost / found
  image_urls    text[] default '{}',

  reporter_id   uuid references auth.users(id) on delete cascade,
  reporter_name text,
  contact_info  text                         -- email / phone (optional)
);

create trigger reports_updated_at
  before update on public.reports
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.reports enable row level security;

-- Public read: anyone can browse lost & found reports
create policy "Public read access for reports"
  on public.reports for select
  using (true);

-- Authenticated users can file reports
create policy "Authenticated users can insert reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- Reporters can update their own reports
create policy "Reporters can update their own reports"
  on public.reports for update
  using (auth.uid() = reporter_id);

-- Reporters can delete their own reports
create policy "Reporters can delete their own reports"
  on public.reports for delete
  using (auth.uid() = reporter_id);

-- ============================================================
-- Messages: Direct messaging between users
-- ============================================================
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  
  item_id       uuid references public.items(id) on delete cascade,
  report_id     uuid references public.reports(id) on delete cascade,
  sender_id     uuid references auth.users(id) on delete cascade not null,
  receiver_id   uuid references auth.users(id) on delete cascade not null,
  content       text not null,
  is_read       boolean not null default false,

  -- At least one of item_id or report_id must be set
  constraint messages_has_context check (item_id is not null or report_id is not null)
);

-- Row Level Security
alter table public.messages enable row level security;

-- Users can read messages they are involved in
create policy "Users can read their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Users can insert messages if they are the sender
create policy "Users can insert messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- ============================================================
-- Profiles: User Onboarding Data
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  
  full_name     text not null,
  address       text not null,
  course        text not null,
  batch         text not null
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;

-- Public read: anyone can view profiles (to see seller/reporter names)
create policy "Public read access for profiles"
  on public.profiles for select
  using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

