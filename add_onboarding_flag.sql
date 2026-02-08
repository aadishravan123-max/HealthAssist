-- Add is_onboarded column to profiles if it doesn't exist
alter table public.profiles
add column if not exists is_onboarded boolean default false;
