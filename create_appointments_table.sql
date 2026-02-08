-- Create Appointments Table
create table if not exists public.appointments (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references public.profiles(id) not null,
    doctor_id uuid references public.profiles(id) not null,
    appointment_date timestamptz not null,
    status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
    reason text,
    created_at timestamptz default now()
);

-- Enable RLS on Appointments
alter table public.appointments enable row level security;

-- Policies for Appointments
-- Patients can view their own appointments
create policy "Patients can view own appointments"
on public.appointments for select
using (auth.uid() = patient_id);

-- Patients can create appointments
create policy "Patients can create appointments"
on public.appointments for insert
with check (auth.uid() = patient_id);

-- Doctors can view assigned appointments
create policy "Doctors can view assigned appointments"
on public.appointments for select
using (auth.uid() = doctor_id);

-- Doctors can update status of their appointments
create policy "Doctors can update assigned appointments"
on public.appointments for update
using (auth.uid() = doctor_id);
