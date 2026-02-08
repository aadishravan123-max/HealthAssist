-- Add Age and Gender to profiles
alter table public.profiles 
add column if not exists age integer,
add column if not exists gender text;

-- Allow users to update their own profile (already covered by "Users can update own profile" policy, but ensuring generic update is allowed)
-- No extra policy needed if the existing one is: using (auth.uid() = id) with check (auth.uid() = id).
-- My previous script used: create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id); 
-- That covers it.
