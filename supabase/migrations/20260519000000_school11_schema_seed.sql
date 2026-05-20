create extension if not exists "uuid-ossp";

create table if not exists school_settings (
  id uuid primary key default uuid_generate_v4(),
  school_name_mn text not null default 'Нийслэлийн 11-р сургууль',
  school_name_en text not null default '11th School',
  established integer default 1940,
  student_count integer default 2000,
  teacher_count integer default 80,
  club_count integer default 40,
  address_mn text default 'Партизаны гудамж, Сүхбаатар дүүрэг',
  city text default 'Улаанбаатар',
  phone text default '+976 11 327226',
  email text default 'School_11@edub.edu.mn',
  facebook_url text,
  instagram_url text,
  youtube_url text,
  twitter_url text,
  updated_at timestamptz default now()
);

insert into school_settings (school_name_mn)
select 'Нийслэлийн 11-р сургууль'
where not exists (select 1 from school_settings);

create table if not exists teachers (
  id uuid primary key default uuid_generate_v4(),
  name_mn text not null,
  name_en text,
  subject_mn text not null,
  subject_en text,
  years_exp integer default 0,
  bio_mn text,
  bio_en text,
  photo_url text,
  is_featured boolean default true,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists news_categories (
  id uuid primary key default uuid_generate_v4(),
  name_mn text not null,
  name_en text,
  color text default '#f59e0b',
  slug text unique not null
);

insert into news_categories (name_mn, name_en, slug, color) values
  ('Олимпиад', 'Olympiad', 'olympiad', '#f59e0b'),
  ('Арга хэмжээ', 'Events', 'events', '#0891b2'),
  ('Спорт', 'Sports', 'sports', '#10b981'),
  ('Урлаг', 'Arts', 'arts', '#8b5cf6'),
  ('Шинэ мэдээ', 'News', 'news', '#ef4444'),
  ('Амжилт', 'Achievement', 'achievement', '#f59e0b')
on conflict (slug) do update set name_mn = excluded.name_mn, name_en = excluded.name_en, color = excluded.color;

create table if not exists news (
  id uuid primary key default uuid_generate_v4(),
  title_mn text not null,
  title_en text,
  excerpt_mn text,
  excerpt_en text,
  body_mn text,
  body_en text,
  cover_image_url text,
  category_id uuid references news_categories(id),
  author_name text not null default 'Сургуулийн захиргаа',
  author_role text default 'Захиргаа',
  author_photo text,
  read_time_min integer default 3,
  is_published boolean default false,
  is_featured boolean default false,
  view_count integer default 0,
  tags text[] default '{}',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_news_published on news(is_published, published_at desc);
create index if not exists idx_news_category on news(category_id);
create index if not exists idx_news_featured on news(is_featured);

create table if not exists achievement_years (
  id uuid primary key default uuid_generate_v4(),
  year integer not null unique,
  highlight_mn text,
  highlight_en text,
  description_mn text,
  description_en text,
  image_url text,
  is_milestone boolean default false,
  display_order integer generated always as (year) stored
);

create index if not exists idx_achievement_years_year on achievement_years(year desc);

create table if not exists achievement_categories (
  id uuid primary key default uuid_generate_v4(),
  name_mn text not null,
  name_en text,
  icon text,
  description_mn text,
  display_order integer default 0
);

insert into achievement_categories (name_mn, name_en, icon, display_order)
select seed.name_mn, seed.name_en, seed.icon, seed.display_order
from (
  values
    ('Сурагчдын амжилт', 'Student Achievements', 'graduation-cap', 1),
    ('Сургуулийн арга хэмжээ', 'School Events', 'building', 2),
    ('Ангийн үйл ажиллагаа', 'Class Activities', 'users', 3),
    ('Багш нарын хувь нэмэр', 'Teacher Contributions', 'award', 4)
) seed(name_mn, name_en, icon, display_order)
where not exists (
  select 1 from achievement_categories existing where existing.name_mn = seed.name_mn
);

create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  year_id uuid references achievement_years(id) on delete cascade,
  category_id uuid references achievement_categories(id),
  title_mn text not null,
  title_en text,
  description_mn text,
  description_en text,
  image_url text,
  is_published boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_achievements_year on achievements(year_id);
create index if not exists idx_achievements_category on achievements(category_id);

create table if not exists course_sections (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title_mn text not null,
  title_en text,
  description_mn text,
  description_en text,
  icon text,
  display_order integer default 0,
  is_active boolean default true
);

insert into course_sections (slug, title_mn, title_en, description_mn, icon, display_order) values
  ('section', 'Секц', 'Sections', 'Математик, физик, хэлний сонгон сургалт', 'book', 1),
  ('calendar', 'Календар', 'Calendar', 'Сорил, тэмцээн, хичээлийн үйл ажиллагаа', 'calendar', 2),
  ('olympiad', 'Олимпиад', 'Olympiad', 'Бэлтгэлийн шаталсан төлөвлөгөө', 'trophy', 3),
  ('club', 'Клуб', 'Clubs', 'Сурагчдын хөгжлийн орчин', 'users', 4)
on conflict (slug) do update set title_mn = excluded.title_mn, description_mn = excluded.description_mn, icon = excluded.icon, display_order = excluded.display_order;

create table if not exists course_items (
  id uuid primary key default uuid_generate_v4(),
  section_id uuid references course_sections(id) on delete cascade,
  title_mn text not null,
  title_en text,
  short_desc_mn text,
  short_desc_en text,
  full_desc_mn text,
  full_desc_en text,
  teacher_name text,
  schedule_mn text,
  location_mn text,
  max_students integer,
  current_students integer default 0,
  tags text[] default '{}',
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_course_items_section on course_items(section_id);

create table if not exists calendar_events (
  id uuid primary key default uuid_generate_v4(),
  title_mn text not null,
  title_en text,
  description_mn text,
  event_type text check (event_type in ('exam', 'olympiad', 'holiday', 'ceremony', 'sport', 'cultural', 'other')) default 'other',
  start_date date not null,
  end_date date,
  start_time time,
  end_time time,
  location_mn text,
  is_all_day boolean default false,
  color text default '#f59e0b',
  is_public boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_calendar_events_date on calendar_events(start_date);
create index if not exists idx_calendar_events_type on calendar_events(event_type);

create table if not exists application_results (
  id uuid primary key default uuid_generate_v4(),
  code char(8) unique not null,
  student_name text,
  status text check (status in ('accepted', 'pending', 'waitlisted', 'rejected', 'incomplete')) not null,
  message_mn text,
  applied_at timestamptz default now(),
  processed_at timestamptz,
  academic_year text default '2024-2025',
  grade_applying integer,
  notes text
);

create index if not exists idx_applications_code on application_results(code);
create index if not exists idx_applications_year on application_results(academic_year);

create or replace function increment_news_view_count(news_id uuid)
returns void
language sql
security definer
as $$
  update news set view_count = coalesce(view_count, 0) + 1 where id = news_id;
$$;

alter table school_settings enable row level security;
alter table teachers enable row level security;
alter table news enable row level security;
alter table news_categories enable row level security;
alter table achievement_years enable row level security;
alter table achievement_categories enable row level security;
alter table achievements enable row level security;
alter table course_sections enable row level security;
alter table course_items enable row level security;
alter table calendar_events enable row level security;
alter table application_results enable row level security;

drop policy if exists "Public read school_settings" on school_settings;
create policy "Public read school_settings" on school_settings for select using (true);
drop policy if exists "Public read active teachers" on teachers;
create policy "Public read active teachers" on teachers for select using (is_active = true);
drop policy if exists "Public read published news" on news;
create policy "Public read published news" on news for select using (is_published = true);
drop policy if exists "Public read news_categories" on news_categories;
create policy "Public read news_categories" on news_categories for select using (true);
drop policy if exists "Public read achievement_years" on achievement_years;
create policy "Public read achievement_years" on achievement_years for select using (true);
drop policy if exists "Public read achievement_categories" on achievement_categories;
create policy "Public read achievement_categories" on achievement_categories for select using (true);
drop policy if exists "Public read achievements" on achievements;
create policy "Public read achievements" on achievements for select using (is_published = true);
drop policy if exists "Public read active course_sections" on course_sections;
create policy "Public read active course_sections" on course_sections for select using (is_active = true);
drop policy if exists "Public read active course_items" on course_items;
create policy "Public read active course_items" on course_items for select using (is_active = true);
drop policy if exists "Public read public calendar_events" on calendar_events;
create policy "Public read public calendar_events" on calendar_events for select using (is_public = true);
drop policy if exists "Lookup application by code" on application_results;
create policy "Lookup application by code" on application_results for select using (true);

insert into teachers (name_mn, subject_mn, years_exp, is_featured, display_order)
select seed.name_mn, seed.subject_mn, seed.years_exp, seed.is_featured, seed.display_order
from (
  values
    ('Д. Наранцэцэг', 'Математик', 18, true, 1),
    ('Б. Энхбаяр', 'Физик', 12, true, 2),
    ('О. Мөнхзул', 'Биологи', 9, true, 3),
    ('Г. Батбаяр', 'Түүх', 15, true, 4),
    ('Х. Солонго', 'Хими', 7, true, 5),
    ('Т. Оюун', 'Англи хэл', 11, true, 6),
    ('Э. Батзориг', 'Монгол хэл', 20, true, 7),
    ('Н. Цэрэндулам', 'Урлаг', 8, true, 8)
) seed(name_mn, subject_mn, years_exp, is_featured, display_order)
where not exists (
  select 1 from teachers existing where existing.name_mn = seed.name_mn
);

insert into achievement_years (year, highlight_mn, description_mn, is_milestone) values
  (1940, 'Сургуулийн үүсгэн байгуулагдсан', 'Нийслэлийн 11-р сургууль 1940 онд байгуулагдсан.', true),
  (1960, 'Анхны төгсөгчдийн ойн тэмдэглэл', 'Сургуулийн анхны төгсөгчид амжилттай суралцлаа.', false),
  (1989, 'Гүнзгийрүүлсэн сургалт нэвтрүүлсэн', 'Математик, физикийн чиглэлээр гүнзгийрүүлсэн хөтөлбөр.', true),
  (2016, 'Шинэ хичээлийн байр нээгдсэн', 'Орчин үеийн тоног төхөөрөмжтэй шинэ байр.', true),
  (2019, 'Урлагийн чиглэлд тэргүүлэгч', 'Улсын урлагийн олимпиадад тэргүүн байр.', false),
  (2020, 'Дижитал сургалтад шилжсэн', 'Цар тахлын үед онлайн сургалтыг амжилттай нэвтрүүлсэн.', false),
  (2021, 'Роботикийн тэмцээнд аварга', 'Улсын роботикийн тэмцээнд тэргүүлсэн.', false),
  (2022, 'Ногоон сургууль', 'Экологийн хамгаалалд тэргүүлэгч сургуулиар шалгарсан.', false),
  (2023, 'Олон улсын хөтөлбөр', 'БНСУ-ын сургуультай хамтын ажиллагаа эхэлсэн.', true),
  (2024, '100% Төгсөлт', 'Бүх сурагч амжилттай төгссөн анхны жил.', true)
on conflict (year) do update set highlight_mn = excluded.highlight_mn, description_mn = excluded.description_mn, is_milestone = excluded.is_milestone;

insert into news (title_mn, excerpt_mn, body_mn, author_name, author_role, is_published, is_featured, read_time_min, tags, published_at, category_id)
select
  'Математикийн олимпиадад тэргүүн байр эзэллээ',
  'Манай сургуулийн сурагчид улсын олимпиадад өндөр амжилт үзүүллээ.',
  'Дэлгэрэнгүй мэдээлэл энд байна. Манай сургуулийн сурагчид улсын математикийн олимпиадад оролцож, тэргүүн байр эзэллээ. Энэ амжилт нь сурагчид болон багш нарын хамтын хөдөлмөрийн үр дүн юм.',
  'Б. Оюунтуяа',
  'Математикийн багш',
  true,
  true,
  4,
  array['математик', 'олимпиад', 'амжилт'],
  now() - interval '2 days',
  id
from news_categories
where slug = 'olympiad'
  and not exists (
    select 1 from news existing
    where existing.title_mn = 'Математикийн олимпиадад тэргүүн байр эзэллээ'
  )
limit 1;

insert into news (title_mn, excerpt_mn, body_mn, author_name, author_role, is_published, is_featured, read_time_min, tags, published_at, category_id)
select
  seed.title_mn,
  seed.excerpt_mn,
  seed.body_mn,
  seed.author_name,
  seed.author_role,
  true,
  false,
  seed.read_time_min,
  seed.tags,
  seed.published_at,
  nc.id
from (
  values
    ('80 жилийн ойд зориулсан түүхэн материал цуглуулах ажил эхэллээ', 'Сургуулийн түүхэн замналыг баримтжуулах ажилд төгсөгчид, багш нар нэгдэж байна.', 'Нийслэлийн 11-р сургуулийн түүхэн ойд зориулан үе үеийн төгсөгчид, ахмад багш нар, сурагчдын дурсамж, гэрэл зураг, баримтат материалыг нэгтгэх ажил эхэллээ.', 'Сургалтын алба', 'Захиргаа', 4, array['түүх','ой','сургууль'], now() - interval '5 days', 'events'),
    ('Сургуулийн аварга шалгаруулах спортын өдөрлөг боллоо', 'Ангиудын багууд хурд, хүч, зохион байгуулалтаараа өрсөлдөв.', 'Спортын өдөрлөгөөр сурагчид багийн ажиллагаа, тэсвэр, шударга өрсөлдөөний соёлыг харууллаа.', 'Г. Бат', 'Дасгалжуулагч', 4, array['спорт','баг','өдөрлөг'], now() - interval '8 days', 'sports'),
    ('Урлагийн студийн сурагчид тайзны шинэ бүтээлээ толилууллаа', 'Найрал дуу, хөгжим, тайзны хөдөлгөөнийг нэгтгэсэн тоглолт үзэгчдэд хүрэв.', 'Урлагийн студийн сурагчид улирлын тайлан тоглолтоо зохион байгуулж, тайзны соёл, бүтээлч багийн ажиллагаагаа харууллаа.', 'О. Солонго', 'Урлагийн багш', 3, array['урлаг','тайз','студи'], now() - interval '12 days', 'arts')
) seed(title_mn, excerpt_mn, body_mn, author_name, author_role, read_time_min, tags, published_at, slug)
join news_categories nc on nc.slug = seed.slug
where not exists (
  select 1 from news existing where existing.title_mn = seed.title_mn
);

insert into course_items (section_id, title_mn, short_desc_mn, teacher_name, schedule_mn, display_order)
select cs.id, item.title_mn, item.short_desc_mn, item.teacher_name, item.schedule_mn, item.display_order
from course_sections cs
join (
  values
    ('section', 'Математик олимпиад', 'Бодлогын арга зүй, нотолгооны соёл.', 'Э.Хүдэрбаатар', 'Мягмар, Пүрэв 15:30', 1),
    ('section', 'Физик судалгаа', 'Туршилт, хэмжилт, инженерчлэлийн суурь.', 'Б.Эрдэнэ', 'Даваа, Лхагва 16:00', 2),
    ('calendar', 'Олимпиадын сорил', 'Сарын нэгдсэн сорилын хуваарь.', 'Сургалтын алба', 'Сар бүрийн эхний Баасан', 1),
    ('olympiad', 'Математик бэлтгэл', 'Аймаг, нийслэл, улсын түвшний бодлого.', 'Э.Хүдэрбаатар', 'Даваа, Пүрэв 16:20', 1),
    ('club', 'Роботик ба код', 'Алгоритм, электроник, багийн төсөл.', 'Д.Номин', 'Баасан 15:00', 1),
    ('club', 'Урлагийн студи', 'Найрал дуу, хөгжим, тайзны соёл.', 'О.Солонго', 'Лхагва 15:30', 2)
) item(slug, title_mn, short_desc_mn, teacher_name, schedule_mn, display_order) on item.slug = cs.slug
where not exists (
  select 1 from course_items existing
  where existing.section_id = cs.id and existing.title_mn = item.title_mn
);

insert into calendar_events (title_mn, description_mn, event_type, start_date, is_all_day, location_mn, color)
select seed.title_mn, seed.description_mn, seed.event_type, seed.start_date, seed.is_all_day, seed.location_mn, seed.color
from (
  values
    ('Олимпиадын сорил', 'Сарын нэгдсэн сорил.', 'olympiad', current_date + interval '7 days', true, 'Их танхим', '#f59e0b'),
    ('Эцэг эхийн өдөр', 'Суралцахуйн ахицын уулзалт.', 'ceremony', current_date + interval '14 days', true, 'Сургууль', '#0891b2')
) seed(title_mn, description_mn, event_type, start_date, is_all_day, location_mn, color)
where not exists (
  select 1 from calendar_events existing
  where existing.title_mn = seed.title_mn and existing.start_date = seed.start_date
);

insert into application_results (code, student_name, status, message_mn, academic_year) values
  ('AB123456', 'Тест Сурагч', 'accepted', 'Та амжилттай элслээ. Баяр хүргэе!', '2024-2025'),
  ('CD789012', 'Тест Хоёр', 'pending', 'Таны өргөдөл хянагдаж байна.', '2024-2025'),
  ('EF345678', 'Тест Гурав', 'waitlisted', 'Та нөөц жагсаалтад орсон байна.', '2024-2025'),
  ('GH901234', 'Тест Дөрөв', 'rejected', 'Уучлаарай, энэ удаад элсэлт баталгаажсангүй.', '2024-2025')
on conflict (code) do update set status = excluded.status, message_mn = excluded.message_mn, academic_year = excluded.academic_year;
