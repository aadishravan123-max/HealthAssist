-- Ensure the trigger function exists and handles roles correctly
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta_role text;
  fullname text;
  default_roles jsonb;
begin
  -- Extract data from metadata (passed during signUp)
  meta_role := coalesce(new.raw_user_meta_data->>'role', 'patient');
  fullname := new.raw_user_meta_data->>'full_name';
  
  -- Determine roles jsonb array
  if meta_role = 'doctor' then
    default_roles := '["doctor"]'::jsonb; -- Or '["doctor", "patient"]' if you want them to have both by default
  else
    default_roles := '["patient"]'::jsonb;
  end if;

  -- Insert into profiles
  insert into public.profiles (id, full_name, email, role, roles)
  values (
    new.id,
    fullname,
    new.email,
    meta_role, -- legacy column
    default_roles -- new column
  )
  on conflict (id) do update set
    role = excluded.role,
    roles = excluded.roles;

  return new;
end;
$$;

-- Ensure the trigger is attached to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
