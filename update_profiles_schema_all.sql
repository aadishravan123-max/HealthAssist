-- Comprehensive migration to add all potential missing columns to profiles table

-- 1. Add patient specific columns
alter table public.profiles 
add column if not exists age integer,
add column if not exists gender text,
add column if not exists doctor_name text;

-- 2. Add doctor specific columns
alter table public.profiles 
add column if not exists specialization text,
add column if not exists experience_years integer,
add column if not exists hospital_name text;

-- 3. Add other columns that might be missing from other migrations
alter table public.profiles
add column if not exists roles jsonb default '["patient"]'::jsonb,
add column if not exists is_onboarded boolean default false;
