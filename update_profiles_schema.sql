-- Add doctor_name column to profiles table
alter table public.profiles 
add column if not exists doctor_name text;

-- Add updated_at if not exists (safeguard)
alter table public.profiles
add column if not exists updated_at timestamptz default now();
