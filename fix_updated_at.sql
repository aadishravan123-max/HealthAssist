-- Fix missing column for profiles
-- Run this in Supabase SQL Editor

alter table public.profiles 
add column if not exists updated_at timestamptz default now();
