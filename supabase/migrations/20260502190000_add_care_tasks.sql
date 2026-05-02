create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  type text not null check (type in (
    'vet_appointment',
    'walk',
    'training',
    'eye_cleaning',
    'ear_cleaning',
    'brushing',
    'bath',
    'grooming',
    'other'
  )),
  title text not null,
  description text,
  start_date date not null,
  end_date date,
  time_of_day time not null,
  days_of_week int[] not null default '{}',
  repeat_rule text not null default 'weekly' check (repeat_rule in ('once', 'daily', 'weekly', 'monthly', 'every_n_days')),
  repeat_interval int not null default 1 check (repeat_interval > 0),
  reminder_minutes_before int not null default 0,
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.care_task_checks (
  id uuid primary key default gen_random_uuid(),
  care_task_id uuid not null references public.care_tasks (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  status text not null default 'pendiente' check (status in ('pendiente', 'hecha', 'saltada')),
  completed_by uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (care_task_id, scheduled_at)
);

alter table public.care_tasks enable row level security;
alter table public.care_task_checks enable row level security;

drop policy if exists "care_tasks_select_member" on public.care_tasks;
create policy "care_tasks_select_member"
on public.care_tasks
for select
using (public.is_household_member(household_id));

drop policy if exists "care_tasks_insert_editors" on public.care_tasks;
create policy "care_tasks_insert_editors"
on public.care_tasks
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "care_tasks_update_editors" on public.care_tasks;
create policy "care_tasks_update_editors"
on public.care_tasks
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "care_task_checks_select_member" on public.care_task_checks;
create policy "care_task_checks_select_member"
on public.care_task_checks
for select
using (public.is_household_member(household_id));

drop policy if exists "care_task_checks_insert_editors" on public.care_task_checks;
create policy "care_task_checks_insert_editors"
on public.care_task_checks
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "care_task_checks_update_editors" on public.care_task_checks;
create policy "care_task_checks_update_editors"
on public.care_task_checks
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

alter table public.reminders
drop constraint if exists reminders_type_check;

alter table public.reminders
add constraint reminders_type_check
check (type in ('meal', 'medication', 'care', 'supply', 'vet', 'custom'));

create index if not exists idx_care_tasks_household_pet on public.care_tasks (household_id, pet_id, active);
create index if not exists idx_care_tasks_pet_id on public.care_tasks (pet_id);
create index if not exists idx_care_tasks_created_by on public.care_tasks (created_by);
create index if not exists idx_care_task_checks_household_pet on public.care_task_checks (household_id, pet_id, scheduled_at desc);
create index if not exists idx_care_task_checks_pet_id on public.care_task_checks (pet_id);
create index if not exists idx_care_task_checks_completed_by on public.care_task_checks (completed_by);

drop trigger if exists set_care_tasks_updated_at on public.care_tasks;
create trigger set_care_tasks_updated_at
before update on public.care_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_care_task_checks_updated_at on public.care_task_checks;
create trigger set_care_task_checks_updated_at
before update on public.care_task_checks
for each row execute function public.set_updated_at();

alter table public.care_task_checks replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.care_task_checks;
exception
  when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
