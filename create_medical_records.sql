-- Reset medical_records table to ensure correct schema
drop table if exists public.medical_records;

-- Create medical_records table
create table public.medical_records (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    record_type text not null check (record_type in ('lab_test', 'prescription')),
    date date not null,
    doctor_name text, -- For prescriptions
    test_name text, -- For lab tests
    test_category text, -- For lab tests (Hematology, etc.)
    test_results jsonb, -- Flexible storage for test parameters and values
    prescription_text text, -- For prescriptions
    created_at timestamptz default now()
);

-- RLS Policies
alter table public.medical_records enable row level security;

create policy "Users can view their own medical records"
on public.medical_records for select
using (auth.uid() = user_id);

create policy "Users can insert their own medical records"
on public.medical_records for insert
with check (auth.uid() = user_id);

create policy "Users can update their own medical records"
on public.medical_records for update
using (auth.uid() = user_id);

create policy "Users can delete their own medical records"
on public.medical_records for delete
using (auth.uid() = user_id);
