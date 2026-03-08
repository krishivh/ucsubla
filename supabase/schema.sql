-- ============================================================
-- UCSubLA — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  verified_ucla boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, verified_ucla)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email ilike '%@ucla.edu'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LISTINGS
-- ============================================================
create table if not exists public.listings (
  id                    uuid primary key default uuid_generate_v4(),
  title                 text not null,
  price                 integer not null,
  address               text not null,
  distance_from_campus  numeric(4,2) not null default 0.5,
  images                text[] not null default '{}',
  room_type             text not null check (room_type in ('single','double','triple+')),
  bathroom_type         text not null check (bathroom_type in ('private','shared')),
  move_in_date          date not null,
  move_out_date         date not null,
  quarter               text[] not null default '{}',
  roommate_preference   text not null check (roommate_preference in ('male','female','coed')),
  verified_ucla         boolean not null default false,
  description           text not null default '',
  lister_id             uuid not null references public.profiles(id) on delete cascade,
  -- Amenities (flattened for easy querying)
  amenity_furnished       boolean not null default false,
  amenity_internet        boolean not null default false,
  amenity_ac              boolean not null default false,
  amenity_fridge          boolean not null default false,
  amenity_microwave       boolean not null default false,
  amenity_dishwasher      boolean not null default false,
  amenity_laundry_in_unit boolean not null default false,
  amenity_laundry_on_site boolean not null default false,
  amenity_balcony         boolean not null default false,
  amenity_parking         text check (amenity_parking in ('covered','garage','street')) default null,
  amenity_fitness_center  boolean not null default false,
  amenity_pool            boolean not null default false,
  amenity_hot_tub         boolean not null default false,
  amenity_accessible      boolean not null default false,
  amenity_ground_floor    boolean not null default false,
  created_at            timestamptz not null default now()
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
create table if not exists public.bookmarks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table if not exists public.conversations (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid not null references public.listings(id) on delete cascade,
  -- Always two participants: requester + lister
  requester_id uuid not null references public.profiles(id) on delete cascade,
  lister_id    uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (listing_id, requester_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  text            text not null,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: anyone can read, only owner can update
alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Listings: anyone can read, only owner can insert/update/delete
alter table public.listings enable row level security;
create policy "listings_select" on public.listings for select using (true);
create policy "listings_insert" on public.listings for insert with check (auth.uid() = lister_id);
create policy "listings_update" on public.listings for update using (auth.uid() = lister_id);
create policy "listings_delete" on public.listings for delete using (auth.uid() = lister_id);

-- Bookmarks: each user manages only their own
alter table public.bookmarks enable row level security;
create policy "bookmarks_select" on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete" on public.bookmarks for delete using (auth.uid() = user_id);

-- Conversations: only participants can see
alter table public.conversations enable row level security;
create policy "conversations_select" on public.conversations for select
  using (auth.uid() = requester_id or auth.uid() = lister_id);
create policy "conversations_insert" on public.conversations for insert
  with check (auth.uid() = requester_id);

-- Messages: only conversation participants can read/write
alter table public.messages enable row level security;
create policy "messages_select" on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.requester_id = auth.uid() or c.lister_id = auth.uid())
    )
  );
create policy "messages_insert" on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.requester_id = auth.uid() or c.lister_id = auth.uid())
    )
  );
create policy "messages_update" on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.requester_id = auth.uid() or c.lister_id = auth.uid())
    )
  );

-- ============================================================
-- STORAGE BUCKET for listing images
-- ============================================================
-- Run this separately in Storage section or via SQL:
-- insert into storage.buckets (id, name, public) values ('listing_images', 'listing_images', true);
-- create policy "listing_images_public_read" on storage.objects for select using (bucket_id = 'listing_images');
-- create policy "listing_images_auth_upload" on storage.objects for insert with check (bucket_id = 'listing_images' and auth.role() = 'authenticated');
-- create policy "listing_images_owner_delete" on storage.objects for delete using (bucket_id = 'listing_images' and auth.uid()::text = (storage.foldername(name))[1]);
