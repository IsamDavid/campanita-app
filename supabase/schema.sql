create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.complete_signup(
  p_full_name text,
  p_household_name text,
  p_household_code text default null,
  p_pet_name text default null,
  p_breed text default null
)
returns table (
  result_household_id uuid,
  result_role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
  v_household_code text := nullif(upper(trim(coalesce(p_household_code, ''))), '');
  v_role text := 'owner';
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  insert into public.profiles (id, full_name)
  values (v_user_id, nullif(trim(coalesce(p_full_name, '')), ''))
  on conflict (id) do update
  set full_name = excluded.full_name;

  if v_household_code is not null then
    select h.id
    into v_household_id
    from public.households h
    where h.invite_code = v_household_code
    limit 1;

    if v_household_id is null then
      raise exception 'Invalid household code';
    end if;

    v_role := 'caregiver';
  else
    insert into public.households (name, created_by)
    values (
      coalesce(nullif(trim(coalesce(p_household_name, '')), ''), 'Familia Campanita'),
      v_user_id
    )
    returning id into v_household_id;

    insert into public.pets (household_id, name, species, breed)
    values (
      v_household_id,
      coalesce(nullif(trim(coalesce(p_pet_name, '')), ''), 'Campanita'),
      'Perro',
      nullif(trim(coalesce(p_breed, '')), '')
    );
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (v_household_id, v_user_id, v_role)
  on conflict (household_id, user_id) do update
  set role = excluded.role;

  return query
  select v_household_id, v_role;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.households
add column if not exists invite_code text;

update public.households
set invite_code = upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8))
where invite_code is null;

alter table if exists public.households
alter column invite_code set default upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));

alter table if exists public.households
alter column invite_code set not null;

create unique index if not exists idx_households_invite_code on public.households (invite_code);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'caregiver', 'viewer')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (household_id, user_id)
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  species text,
  breed text,
  birthdate date,
  photo_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stool_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  photo_url text,
  consistency text not null check (consistency in ('liquida', 'blanda', 'normal', 'dura')),
  color text,
  has_blood boolean not null default false,
  has_mucus boolean not null default false,
  strong_smell boolean not null default false,
  notes text,
  occurred_at timestamptz not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  type text not null,
  severity text,
  notes text,
  occurred_at timestamptz not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  name text not null,
  food_type text,
  quantity text,
  preparation text,
  notes text,
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meal_schedules (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  time_of_day time not null,
  days_of_week int[] not null default '{}',
  reminder_minutes_before int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.meal_checks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  meal_id uuid not null references public.meals (id) on delete cascade,
  schedule_id uuid not null references public.meal_schedules (id) on delete cascade,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  status text not null default 'pendiente' check (status in ('pendiente', 'dada', 'saltada')),
  completed_by uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (schedule_id, scheduled_at)
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  name text not null,
  dosage text,
  frequency text,
  instructions text,
  start_date date,
  end_date date,
  prescription_photo_url text,
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  time_of_day time not null,
  days_of_week int[] not null default '{}',
  reminder_minutes_before int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medication_checks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  medication_id uuid not null references public.medications (id) on delete cascade,
  schedule_id uuid not null references public.medication_schedules (id) on delete cascade,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  status text not null default 'pendiente' check (status in ('pendiente', 'dada', 'saltada')),
  completed_by uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (schedule_id, scheduled_at)
);

create table if not exists public.supplies (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  name text not null,
  category text,
  purchase_date date,
  estimated_runout_date date,
  quantity text,
  price numeric,
  store text,
  photo_url text,
  notes text,
  status text not null default 'suficiente' check (status in ('suficiente', 'pronto_se_acaba', 'urgente')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vet_visits (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  visit_date date not null,
  vet_name text,
  reason text,
  diagnosis text,
  treatment text,
  weight numeric,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vaccines (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  name text not null,
  applied_at date,
  next_due_date date,
  document_url text,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  type text,
  title text not null,
  file_url text not null,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, endpoint)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  type text not null check (type in ('meal', 'medication', 'supply', 'vet', 'custom')),
  related_id uuid,
  title text not null,
  body text,
  remind_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (household_id, related_id, remind_at)
);

create index if not exists idx_household_members_user_id on public.household_members (user_id);
create index if not exists idx_pets_household on public.pets (household_id);
create index if not exists idx_stool_logs_household_pet on public.stool_logs (household_id, pet_id, occurred_at desc);
create index if not exists idx_symptom_logs_household_pet on public.symptom_logs (household_id, pet_id, occurred_at desc);
create index if not exists idx_meals_household_pet on public.meals (household_id, pet_id);
create index if not exists idx_meal_schedules_household_pet on public.meal_schedules (household_id, pet_id);
create index if not exists idx_meal_checks_household_pet on public.meal_checks (household_id, pet_id, scheduled_at desc);
create index if not exists idx_medications_household_pet on public.medications (household_id, pet_id);
create index if not exists idx_medication_schedules_household_pet on public.medication_schedules (household_id, pet_id);
create index if not exists idx_medication_checks_household_pet on public.medication_checks (household_id, pet_id, scheduled_at desc);
create index if not exists idx_supplies_household_pet on public.supplies (household_id, pet_id);
create index if not exists idx_vet_visits_household_pet on public.vet_visits (household_id, pet_id, visit_date desc);
create index if not exists idx_vaccines_household_pet on public.vaccines (household_id, pet_id);
create index if not exists idx_documents_household_pet on public.documents (household_id, pet_id);
create index if not exists idx_push_subscriptions_household_user on public.push_subscriptions (household_id, user_id);
create index if not exists idx_reminders_household_status on public.reminders (household_id, status, remind_at);

drop trigger if exists set_stool_logs_updated_at on public.stool_logs;
create trigger set_stool_logs_updated_at
before update on public.stool_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_meals_updated_at on public.meals;
create trigger set_meals_updated_at
before update on public.meals
for each row execute function public.set_updated_at();

drop trigger if exists set_meal_checks_updated_at on public.meal_checks;
create trigger set_meal_checks_updated_at
before update on public.meal_checks
for each row execute function public.set_updated_at();

drop trigger if exists set_medications_updated_at on public.medications;
create trigger set_medications_updated_at
before update on public.medications
for each row execute function public.set_updated_at();

drop trigger if exists set_medication_checks_updated_at on public.medication_checks;
create trigger set_medication_checks_updated_at
before update on public.medication_checks
for each row execute function public.set_updated_at();

drop trigger if exists set_supplies_updated_at on public.supplies;
create trigger set_supplies_updated_at
before update on public.supplies
for each row execute function public.set_updated_at();

drop trigger if exists set_vet_visits_updated_at on public.vet_visits;
create trigger set_vet_visits_updated_at
before update on public.vet_visits
for each row execute function public.set_updated_at();

alter table public.meal_checks replica identity full;
alter table public.medication_checks replica identity full;
alter table public.stool_logs replica identity full;

alter publication supabase_realtime add table public.meal_checks;
alter publication supabase_realtime add table public.medication_checks;
alter publication supabase_realtime add table public.stool_logs;
