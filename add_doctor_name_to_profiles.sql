-- Add doctor_name column to profiles table which was missing
alter table public.profiles 
add column if not exists doctor_name text;
