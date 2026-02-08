-- Add doctor-specific columns to profiles table
alter table public.profiles 
add column if not exists specialization text,
add column if not exists experience_years integer,
add column if not exists hospital_name text;
