-- handle_new_user chạy với quyền supabase_auth_admin (search_path khác), nên
-- cast enum `::profile_role` / `::grade_band` không tìm thấy type trong schema
-- public. Cố định search_path = public cho function.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
