-- Update function to handle new user signup automatically with Role Metadata
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'patient') -- Use role from metadata or default to patient
  );
  return new;
end;
$$ language plpgsql security definer;
