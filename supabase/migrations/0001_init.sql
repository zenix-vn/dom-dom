-- =====================================================================
-- Đom Đóm — schema khởi tạo
-- Mô hình "group" tổng quát phục vụ cả phụ huynh (family) lẫn trường (class).
-- Bật RLS toàn bộ; từ chối mặc định, mở quyền theo membership.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type grade_band as enum ('tieu-hoc', 'thcs');
create type profile_role as enum ('student', 'guardian', 'teacher', 'admin');
create type group_type as enum ('family', 'class');
create type member_role as enum ('student', 'guardian', 'teacher');

-- ---------- Người dùng ----------
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         profile_role not null default 'student',
  display_name text not null,
  grade_band   grade_band,
  avatar       text,
  created_at   timestamptz not null default now()
);

-- ---------- Nhóm (gia đình / lớp học) ----------
create table groups (
  id         uuid primary key default gen_random_uuid(),
  type       group_type not null,
  name       text not null,
  join_code  text unique,
  owner_id   uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table group_members (
  group_id    uuid not null references groups (id) on delete cascade,
  profile_id  uuid not null references profiles (id) on delete cascade,
  member_role member_role not null,
  joined_at   timestamptz not null default now(),
  primary key (group_id, profile_id)
);

-- Hàm tiện ích: user hiện tại có chung group với profile mục tiêu không?
create or replace function shares_group_with(target uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1
    from group_members me
    join group_members other on other.group_id = me.group_id
    where me.profile_id = auth.uid()
      and me.member_role in ('guardian', 'teacher')
      and other.profile_id = target
  );
$$;

-- ---------- Nội dung học ----------
create table subjects (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  grade_band grade_band not null
);

create table lessons (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references subjects (id) on delete cascade,
  title       text not null,
  sort_order  int not null default 0
);

create table questions (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references lessons (id) on delete cascade,
  stem        text not null,
  choices     jsonb not null,           -- mảng chuỗi
  answer      int not null,             -- index đáp án đúng
  explanation text,
  difficulty  int not null default 1
);

-- ---------- Registry game (plugin) ----------
create table games (
  id              text primary key,      -- 'typing-basic', 'quiz', ...
  manifest        jsonb not null,        -- GameManifest
  enabled         boolean not null default true,
  min_app_version text,
  created_at      timestamptz not null default now()
);

create table game_assignments (
  id         uuid primary key default gen_random_uuid(),
  game_id    text not null references games (id) on delete cascade,
  group_id   uuid references groups (id) on delete cascade,
  grade_band grade_band
);

-- ---------- Tiến độ & gắn kết ----------
create table game_sessions (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  game_id    text not null references games (id) on delete cascade,
  score      int not null default 0,
  max_score  int not null default 0,
  duration_ms int not null default 0,
  raw        jsonb,
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);

create table xp_events (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  source     text not null,
  amount     int not null,
  created_at timestamptz not null default now()
);

create table streaks (
  profile_id      uuid primary key references profiles (id) on delete cascade,
  current         int not null default 0,
  longest         int not null default 0,
  last_active_day int
);

create table firefly_state (
  profile_id       uuid primary key references profiles (id) on delete cascade,
  energy           real not null default 1.0,
  last_updated_day int not null default 0
);

create table review_items (
  profile_id uuid not null references profiles (id) on delete cascade,
  item_id    text not null,
  box        int not null default 0,
  due_day    int not null,
  primary key (profile_id, item_id)
);

create table mastery (
  profile_id uuid not null references profiles (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  score      real not null default 0,
  primary key (profile_id, subject_id)
);

-- ---------- Xã hội ----------
create table friendships (
  a_profile_id uuid not null references profiles (id) on delete cascade,
  b_profile_id uuid not null references profiles (id) on delete cascade,
  status       text not null default 'pending',
  primary key (a_profile_id, b_profile_id)
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table profiles        enable row level security;
alter table groups          enable row level security;
alter table group_members   enable row level security;
alter table subjects        enable row level security;
alter table lessons         enable row level security;
alter table questions       enable row level security;
alter table games           enable row level security;
alter table game_assignments enable row level security;
alter table game_sessions   enable row level security;
alter table xp_events       enable row level security;
alter table streaks         enable row level security;
alter table firefly_state   enable row level security;
alter table review_items    enable row level security;
alter table mastery         enable row level security;
alter table friendships     enable row level security;

-- Hồ sơ: tự đọc/sửa; guardian/teacher đọc hồ sơ học sinh cùng group.
create policy profiles_self on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_group_read on profiles
  for select using (shares_group_with(id));

-- Nhóm: thành viên đọc; chủ nhóm sửa.
create policy groups_member_read on groups
  for select using (
    exists (select 1 from group_members gm
            where gm.group_id = id and gm.profile_id = auth.uid())
  );
create policy groups_owner_all on groups
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy members_read on group_members
  for select using (
    profile_id = auth.uid()
    or exists (select 1 from groups g
               where g.id = group_id and g.owner_id = auth.uid())
  );

-- Nội dung & registry: ai đăng nhập cũng đọc được (admin ghi qua service role).
create policy content_read_subjects on subjects for select using (true);
create policy content_read_lessons  on lessons   for select using (true);
create policy content_read_questions on questions for select using (true);
create policy games_read on games for select using (enabled);
create policy assignments_read on game_assignments for select using (true);

-- Dữ liệu cá nhân: tự đọc/ghi; guardian/teacher chỉ đọc của học sinh cùng group.
-- (Ghi điểm "chính thức" nên đi qua Edge Function bằng service role.)
create policy sessions_self on game_sessions
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy sessions_group_read on game_sessions
  for select using (shares_group_with(profile_id));

create policy xp_self on xp_events
  for select using (profile_id = auth.uid() or shares_group_with(profile_id));

create policy streaks_self on streaks
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy streaks_group_read on streaks
  for select using (shares_group_with(profile_id));

create policy firefly_self on firefly_state
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy reviews_self on review_items
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy mastery_self on mastery
  for select using (profile_id = auth.uid() or shares_group_with(profile_id));

create policy friendships_self on friendships
  for all using (a_profile_id = auth.uid() or b_profile_id = auth.uid())
  with check (a_profile_id = auth.uid());

-- =====================================================================
-- Tự tạo profile khi có user mới trong auth.users
-- =====================================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
