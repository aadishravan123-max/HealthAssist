-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('patient', 'doctor', 'admin')) default 'patient',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" 
on public.profiles for select using (true);

create policy "Users can insert their own profile" 
on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update using (auth.uid() = id);

-- Function to handle new user signup automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'patient');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. MEDICAL RECORDS TABLE
create table public.medical_records (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) not null,
  title text not null,
  doctor_name text,
  date date not null,
  type text not null, -- 'Lab', 'Prescription', 'Imaging'
  category text, 
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.medical_records enable row level security;

-- Policies for Medical Records
create policy "Patients can view their own records"
on public.medical_records for select using (auth.uid() = patient_id);

create policy "Doctors can view all records"
on public.medical_records for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'doctor')
);

create policy "Patients can insert their own records"
on public.medical_records for insert with check (auth.uid() = patient_id);


-- 3. TIMELINE EVENTS TABLE
create table public.timeline_events (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) not null,
  title text not null,
  date date not null,
  type text not null, -- 'checkup', 'lab', 'vital', 'diagnosis'
  description text,
  is_abnormal boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.timeline_events enable row level security;

-- Policies for Timeline
create policy "Patients can view their own timeline"
on public.timeline_events for select using (auth.uid() = patient_id);

create policy "Doctors can view all timelines"
on public.timeline_events for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'doctor')
);

-- 4. INSERT SOME SEED DATA (Optional, just for testing if you manually run it)
-- Note: You can't easily seed UUIDs that match auth.users without creating users first.
-- So we skip seeding user-dependent data here.
