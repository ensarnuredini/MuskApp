-- ============================================
-- Teuhidu Nur — Database Setup & Seed Data
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Create products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  gender text not null check (gender in ('male', 'female', 'unisex')),
  image_url text,
  description text,
  in_stock boolean default true,
  scent_family text[],
  season text[],
  intensity text check (intensity in ('light', 'moderate', 'strong')),
  occasion text[],
  accords jsonb,
  prices jsonb not null,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table products enable row level security;

-- 3. RLS Policies
create policy "Public read" on products for select using (true);
create policy "Admin write" on products for all using (auth.role() = 'authenticated');

-- 4. Seed data: 3 male products
insert into products (name, gender, image_url, description, in_stock, scent_family, season, intensity, occasion, accords, prices)
values
(
  'Aventus',
  'male',
  'https://picsum.photos/400/500?random=1',
  'A bold and sophisticated fragrance with fruity top notes and a woody base. Inspired by strength and power.',
  true,
  '{"woody","citrus","fresh"}',
  '{"spring","summer"}',
  'strong',
  '{"daily","special"}',
  '[{"name":"Fruity","color":"#e84a2e"},{"name":"Woody","color":"#7a4f2e"},{"name":"Citrus","color":"#d4e84a"},{"name":"Fresh","color":"#4abfe8"}]',
  '{"musk":{"5":8,"10":15,"50":60},"spray":{"30":35,"50":55,"100":90}}'
),
(
  'Oud Royal',
  'male',
  'https://picsum.photos/400/500?random=2',
  'A luxurious oriental oud with deep amber and sandalwood notes. Perfect for evening occasions.',
  true,
  '{"oud","oriental","woody"}',
  '{"autumn","winter"}',
  'strong',
  '{"evening","special"}',
  '[{"name":"Oud","color":"#3d2b1f"},{"name":"Amber","color":"#d4a84b"},{"name":"Sandalwood","color":"#c4a882"}]',
  '{"musk":{"5":10,"10":18,"50":70},"spray":{"30":40,"50":65,"100":105}}'
),
(
  'Blue Horizon',
  'male',
  'https://picsum.photos/400/500?random=3',
  'A crisp and invigorating aquatic fragrance with bergamot and sea salt accords. Ideal for daily wear.',
  true,
  '{"fresh","citrus","musky"}',
  '{"spring","summer"}',
  'moderate',
  '{"daily"}',
  '[{"name":"Aquatic","color":"#2e8be8"},{"name":"Citrus","color":"#e8d44a"},{"name":"Musky","color":"#b8a88a"}]',
  '{"musk":{"5":7,"10":13,"50":50},"spray":{"30":30,"50":48,"100":80}}'
),
-- 5. Seed data: 3 female products
(
  'Rose Elixir',
  'female',
  'https://picsum.photos/400/500?random=4',
  'An enchanting floral bouquet of Bulgarian rose and peony with a warm vanilla dry-down.',
  true,
  '{"floral","oriental"}',
  '{"spring","autumn"}',
  'moderate',
  '{"daily","evening"}',
  '[{"name":"Rose","color":"#e84a6f"},{"name":"Peony","color":"#f0a0b8"},{"name":"Vanilla","color":"#f5e6c8"}]',
  '{"musk":{"5":9,"10":16,"50":62},"spray":{"30":38,"50":58,"100":95}}'
),
(
  'Midnight Jasmine',
  'female',
  'https://picsum.photos/400/500?random=5',
  'A mysterious and seductive blend of night-blooming jasmine with dark plum and musk undertones.',
  true,
  '{"floral","musky","oriental"}',
  '{"autumn","winter"}',
  'strong',
  '{"evening","special"}',
  '[{"name":"Jasmine","color":"#f5f0d0"},{"name":"Plum","color":"#8b2f6a"},{"name":"Musk","color":"#a89080"}]',
  '{"musk":{"5":10,"10":18,"50":68},"spray":{"30":42,"50":62,"100":100}}'
),
(
  'Citrus Blossom',
  'female',
  'https://picsum.photos/400/500?random=6',
  'A bright and uplifting fragrance with Italian lemon, orange blossom, and white tea.',
  true,
  '{"citrus","floral","fresh"}',
  '{"spring","summer"}',
  'light',
  '{"daily"}',
  '[{"name":"Citrus","color":"#f0d44a"},{"name":"Orange Blossom","color":"#f0a040"},{"name":"White Tea","color":"#e8e0d0"}]',
  '{"musk":{"5":6,"10":11,"50":45},"spray":{"30":28,"50":44,"100":72}}'
);

-- 6. Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,
  items jsonb not null,
  total_price numeric not null,
  status text not null check (status in ('pending', 'completed', 'cancelled')) default 'pending',
  created_at timestamptz default now()
);

-- 7. Enable RLS and Policies for orders
alter table orders enable row level security;
create policy "Public insert" on orders for insert with check (true);
create policy "Public select" on orders for select using (true);
create policy "Admin all" on orders for all using (auth.role() = 'authenticated');
