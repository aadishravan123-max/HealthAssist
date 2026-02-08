-- 1. Update Profiles for Dual Roles
alter table public.profiles
add column if not exists roles jsonb default '["patient"]'::jsonb,
add column if not exists is_onboarded boolean default false;

-- 2. Update Medical Records for Doctor Uploads
alter table public.medical_records
add column if not exists uploaded_by text default 'patient' check (uploaded_by in ('patient', 'doctor')),
add column if not exists doctor_id uuid references public.profiles(id);

-- 3. Create Appointments Table
create table if not exists public.appointments (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references public.profiles(id) not null,
    doctor_id uuid references public.profiles(id) not null,
    appointment_date timestamptz not null,
    status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
    reason text,
    created_at timestamptz default now()
);

-- 4. Enable RLS on Appointments
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

-- Doctors can view appointments where they are the doctor
create policy "Doctors can view assigned appointments"
on public.appointments for select
using (auth.uid() = doctor_id);

-- Doctors can update status of their appointments
create policy "Doctors can update assigned appointments"
on public.appointments for update
using (auth.uid() = doctor_id);


-- 5. Update Medical Records RLS to allow Doctor Access
-- Doctors can view records of patients they have an appointment with
create policy "Doctors can view patient records via appointment"
on public.medical_records for select
using (
    exists (
        select 1 from public.appointments
        where doctor_id = auth.uid()
        and patient_id = medical_records.user_id
    )
);

-- Doctors can insert records for patients they have an appointment with
create policy "Doctors can insert records for patients via appointment"
on public.medical_records for insert
with check (
    exists (
        select 1 from public.appointments
        where doctor_id = auth.uid()
        and patient_id = medical_records.user_id
    )
    and uploaded_by = 'doctor'
    and doctor_id = auth.uid()
);
