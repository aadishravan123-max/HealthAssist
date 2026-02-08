-- Enable RLS on profiles if not already enabled
alter table public.profiles enable row level security;

-- Allow users to view their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

-- Allow users to update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- Allow public read of doctors (for Find Doctors page)
drop policy if exists "Public can view doctors" on public.profiles;
create policy "Public can view doctors"
on public.profiles for select
using (roles @> '["doctor"]');
