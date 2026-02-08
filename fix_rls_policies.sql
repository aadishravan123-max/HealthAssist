-- Fix RLS Policies for Profiles table to prevent deadlocks
-- Run this in Supabase SQL Editor

-- 1. Drop existing potentially conflicting policies
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Enable insert for authenticated users only" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;

-- 2. Re-create permissive policies for authenticated users

-- View: Everyone can view basic profile info
create policy "Public profiles are viewable by everyone" 
on public.profiles for select using (true);

-- Insert: Users can insert their own profile
create policy "Users can insert their own profile" 
on public.profiles for insert with check (auth.uid() = id);

-- Update: Users can update their own profile
create policy "Users can update own profile" 
on public.profiles for update using (auth.uid() = id);

-- 3. Ensure columns exist and permissions are granted
alter table public.profiles 
add column if not exists age integer,
add column if not exists gender text;

grant all on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
