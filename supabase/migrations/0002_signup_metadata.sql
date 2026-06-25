-- Cho phép truyền role / grade_band / display_name khi đăng ký
-- (qua user_metadata), thay vì luôn mặc định 'student'.

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, role, grade_band)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::profile_role, 'student'),
    (new.raw_user_meta_data->>'grade_band')::grade_band
  );
  return new;
end;
$$;
