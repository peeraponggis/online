-- 0001_admin_init.sql
-- Schema + RLS สำหรับหน้าแอดมินบริหารจัดการข้อมูล
-- รันใน Supabase Dashboard -> SQL Editor (รันตามลำดับ)

-- ============================================================
-- 1. ตาราง
-- ============================================================

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists instructors (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  name        text not null,
  title       text not null,
  experience  text not null default '',
  students    int  not null default 0,
  avatar      text not null default '👨‍🏫',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists plans (
  code       text primary key,
  name       text not null,
  price      int  not null check (price >= 0),
  quota      int  not null,
  max_tier   int  not null check (max_tier between 1 and 3),
  feats      jsonb not null default '[]'::jsonb,
  sort_order int  not null default 0,
  created_at timestamptz not null default now(),
  constraint plans_quota_valid check (quota = -1 or quota > 0)
);

create table if not exists courses (
  id            uuid primary key default gen_random_uuid(),
  legacy_id     text unique,
  slug          text not null unique,
  title         text not null,
  desc          text not null default '',
  category_id   uuid references categories(id) on delete restrict,
  level         text not null default 'ง่าย' check (level in ('ง่าย','ปานกลาง','ยาก')),
  tier          int  not null default 1 check (tier between 1 and 3),
  credits       int  not null default 1 check (credits > 0),
  price         int  not null default 0 check (price >= 0),
  icon          text not null default '📘',
  cover         text not null default 'emerald',
  rating        numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  students      int  not null default 0 check (students >= 0),
  lessons       int  not null default 0 check (lessons >= 0),
  hours         int  not null default 0 check (hours >= 0),
  certificate   boolean not null default false,
  lifetime      boolean not null default false,
  instructor_id uuid references instructors(id) on delete set null,
  published     boolean not null default false,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists course_topics (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses(id) on delete cascade,
  topic      text not null,
  sort_order int  not null default 0
);

create table if not exists course_syllabus (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses(id) on delete cascade,
  n          int  not null check (n > 0),
  title      text not null,
  duration   text not null default '',
  sort_order int  not null default 0,
  unique (course_id, n)
);

create table if not exists course_files (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses(id) on delete cascade,
  name       text not null,
  size       text not null default '',
  type       text not null default 'PDF',
  sort_order int  not null default 0
);

create table if not exists settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id        bigserial primary key,
  actor_id  uuid references auth.users(id) on delete set null,
  action    text not null check (action in ('create','update','delete','import','login')),
  entity    text not null,
  entity_id text,
  label     text not null default '',
  before    jsonb,
  after     jsonb,
  at        timestamptz not null default now()
);

-- ============================================================
-- 2. ดัชนี
-- ============================================================
create index if not exists courses_category_id_idx   on courses (category_id);
create index if not exists courses_published_idx    on courses (published);
create index if not exists courses_tier_idx         on courses (tier);
create index if not exists courses_updated_at_idx   on courses (updated_at desc);
create index if not exists course_topics_course_idx on course_topics (course_id, sort_order);
create index if not exists course_syllabus_course_idx on course_syllabus (course_id, sort_order);
create index if not exists course_files_course_idx  on course_files (course_id, sort_order);
create index if not exists audit_log_at_idx         on audit_log (at desc);

-- ============================================================
-- 3. updated_at อัปเดตอัตโนมัติ
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists courses_touch on courses;
create trigger courses_touch before update on courses
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on settings;
create trigger settings_touch before update on settings
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 4. RLS
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ตารางที่ทุกคนอ่านได้ และแอดมินเขียนได้
-- เขียนแยกทีละตาราง (ไม่ใช้ loop) เพื่อให้กรีดตรวจ RLS ได้ครบทุกตาราง
alter table public.categories enable row level security;
drop policy if exists "public read" on public.categories;
create policy "public read" on public.categories for select using (true);
drop policy if exists "admin write" on public.categories;
create policy "admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

alter table public.instructors enable row level security;
drop policy if exists "public read" on public.instructors;
create policy "public read" on public.instructors for select using (true);
drop policy if exists "admin write" on public.instructors;
create policy "admin write" on public.instructors for all using (public.is_admin()) with check (public.is_admin());

alter table public.plans enable row level security;
drop policy if exists "public read" on public.plans;
create policy "public read" on public.plans for select using (true);
drop policy if exists "admin write" on public.plans;
create policy "admin write" on public.plans for all using (public.is_admin()) with check (public.is_admin());

alter table public.courses enable row level security;
drop policy if exists "public read published" on public.courses;
create policy "public read published" on public.courses for select
  using (published or public.is_admin());
drop policy if exists "admin write" on public.courses;
create policy "admin write" on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

-- ตารางลูก: อ่านได้เฉพาะเมื่อคอร์สแม่ถูกเผยแพร่
alter table public.course_topics enable row level security;
drop policy if exists "public read" on public.course_topics;
create policy "public read" on public.course_topics for select
  using (exists (select 1 from public.courses c where c.id = course_topics.course_id and c.published));
drop policy if exists "admin write" on public.course_topics;
create policy "admin write" on public.course_topics for all using (public.is_admin()) with check (public.is_admin());

alter table public.course_syllabus enable row level security;
drop policy if exists "public read" on public.course_syllabus;
create policy "public read" on public.course_syllabus for select
  using (exists (select 1 from public.courses c where c.id = course_syllabus.course_id and c.published));
drop policy if exists "admin write" on public.course_syllabus;
create policy "admin write" on public.course_syllabus for all using (public.is_admin()) with check (public.is_admin());

alter table public.course_files enable row level security;
drop policy if exists "public read" on public.course_files;
create policy "public read" on public.course_files for select
  using (exists (select 1 from public.courses c where c.id = course_files.course_id and c.published));
drop policy if exists "admin write" on public.course_files;
create policy "admin write" on public.course_files for all using (public.is_admin()) with check (public.is_admin());

alter table public.settings enable row level security;
drop policy if exists "public read site" on public.settings;
create policy "public read site" on public.settings for select
  using (key in ('bank','site') or public.is_admin());
drop policy if exists "admin write" on public.settings;
create policy "admin write" on public.settings for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.admins enable row level security;
drop policy if exists "admin self read" on public.admins;
create policy "admin self read" on public.admins for select
  using (user_id = auth.uid());
drop policy if exists "admin manage" on public.admins;
create policy "admin manage" on public.admins for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.audit_log enable row level security;
drop policy if exists "admin read" on public.audit_log;
create policy "admin read" on public.audit_log for select using (public.is_admin());
drop policy if exists "admin insert" on public.audit_log;
create policy "admin insert" on public.audit_log for insert with check (public.is_admin());

-- ============================================================
-- 5. ป้องกันการลบหมวดหมู่/ผู้สอน/แพ็กเกจที่ยังถูกอ้างอิง
-- ============================================================
create or replace function public.guard_delete_category()
returns trigger language plpgsql as $$
declare used int;
begin
  select count(*) into used from public.courses where category_id = old.id;
  if used > 0 then
    raise exception 'ลบหมวดหมู่นี้ไม่ได้ ยังมี % คอร์สอยู่ในหมวด กรุณาย้ายคอร์สออกก่อน', used
      using errcode = 'check_violation';
  end if;
  return old;
end;
$$;

drop trigger if exists categories_guard on categories;
create trigger categories_guard before delete on categories
  for each row execute function public.guard_delete_category();

create or replace function public.guard_delete_plan()
returns trigger language plpgsql as $$
begin
  raise exception 'ลบแพ็กเกจไม่ได้ เพราะแพ็กเกจอ้างอิงด้วย max_tier ของคอร์ส — กรุณาปิดเว็บชั่วคราวหรือย้ายคอร์สออกก่อน';
end;
$$;

drop trigger if exists plans_guard on plans;
create trigger plans_guard before delete on plans
  for each row execute function public.guard_delete_plan();
