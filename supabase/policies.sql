create or replace function public.user_role_in_household(p_household_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select hm.role
  from public.household_members hm
  where hm.household_id = p_household_id
    and hm.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_household_member(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = p_household_id
      and hm.user_id = auth.uid()
  )
$$;

create or replace function public.can_manage_household(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.user_role_in_household(p_household_id) in ('owner', 'caregiver'), false)
$$;

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.pets enable row level security;
alter table public.stool_logs enable row level security;
alter table public.symptom_logs enable row level security;
alter table public.meals enable row level security;
alter table public.meal_schedules enable row level security;
alter table public.meal_checks enable row level security;
alter table public.medications enable row level security;
alter table public.medication_schedules enable row level security;
alter table public.medication_checks enable row level security;
alter table public.supplies enable row level security;
alter table public.vet_visits enable row level security;
alter table public.vaccines enable row level security;
alter table public.documents enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "households_select_member" on public.households;
create policy "households_select_member"
on public.households
for select
using (public.is_household_member(id));

drop policy if exists "households_insert_owner" on public.households;
create policy "households_insert_owner"
on public.households
for insert
with check (created_by = auth.uid());

drop policy if exists "households_update_owner" on public.households;
create policy "households_update_owner"
on public.households
for update
using (public.user_role_in_household(id) = 'owner')
with check (public.user_role_in_household(id) = 'owner');

drop policy if exists "household_members_select_member" on public.household_members;
create policy "household_members_select_member"
on public.household_members
for select
using (public.is_household_member(household_id));

drop policy if exists "household_members_insert_owner" on public.household_members;
create policy "household_members_insert_owner"
on public.household_members
for insert
with check (public.user_role_in_household(household_id) = 'owner');

drop policy if exists "household_members_update_owner" on public.household_members;
create policy "household_members_update_owner"
on public.household_members
for update
using (public.user_role_in_household(household_id) = 'owner')
with check (public.user_role_in_household(household_id) = 'owner');

drop policy if exists "household_members_delete_owner" on public.household_members;
create policy "household_members_delete_owner"
on public.household_members
for delete
using (public.user_role_in_household(household_id) = 'owner');

drop policy if exists "pets_select_member" on public.pets;
create policy "pets_select_member"
on public.pets
for select
using (public.is_household_member(household_id));

drop policy if exists "pets_insert_editors" on public.pets;
create policy "pets_insert_editors"
on public.pets
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "pets_update_editors" on public.pets;
create policy "pets_update_editors"
on public.pets
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "stool_logs_select_member" on public.stool_logs;
create policy "stool_logs_select_member"
on public.stool_logs
for select
using (public.is_household_member(household_id));

drop policy if exists "stool_logs_insert_editors" on public.stool_logs;
create policy "stool_logs_insert_editors"
on public.stool_logs
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "stool_logs_update_editors" on public.stool_logs;
create policy "stool_logs_update_editors"
on public.stool_logs
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "symptom_logs_select_member" on public.symptom_logs;
create policy "symptom_logs_select_member"
on public.symptom_logs
for select
using (public.is_household_member(household_id));

drop policy if exists "symptom_logs_insert_editors" on public.symptom_logs;
create policy "symptom_logs_insert_editors"
on public.symptom_logs
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "symptom_logs_update_editors" on public.symptom_logs;
create policy "symptom_logs_update_editors"
on public.symptom_logs
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "meals_select_member" on public.meals;
create policy "meals_select_member"
on public.meals
for select
using (public.is_household_member(household_id));

drop policy if exists "meals_insert_editors" on public.meals;
create policy "meals_insert_editors"
on public.meals
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "meals_update_editors" on public.meals;
create policy "meals_update_editors"
on public.meals
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "meal_schedules_select_member" on public.meal_schedules;
create policy "meal_schedules_select_member"
on public.meal_schedules
for select
using (public.is_household_member(household_id));

drop policy if exists "meal_schedules_insert_editors" on public.meal_schedules;
create policy "meal_schedules_insert_editors"
on public.meal_schedules
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "meal_schedules_update_editors" on public.meal_schedules;
create policy "meal_schedules_update_editors"
on public.meal_schedules
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "meal_checks_select_member" on public.meal_checks;
create policy "meal_checks_select_member"
on public.meal_checks
for select
using (public.is_household_member(household_id));

drop policy if exists "meal_checks_insert_editors" on public.meal_checks;
create policy "meal_checks_insert_editors"
on public.meal_checks
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "meal_checks_update_editors" on public.meal_checks;
create policy "meal_checks_update_editors"
on public.meal_checks
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "medications_select_member" on public.medications;
create policy "medications_select_member"
on public.medications
for select
using (public.is_household_member(household_id));

drop policy if exists "medications_insert_editors" on public.medications;
create policy "medications_insert_editors"
on public.medications
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "medications_update_editors" on public.medications;
create policy "medications_update_editors"
on public.medications
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "medication_schedules_select_member" on public.medication_schedules;
create policy "medication_schedules_select_member"
on public.medication_schedules
for select
using (public.is_household_member(household_id));

drop policy if exists "medication_schedules_insert_editors" on public.medication_schedules;
create policy "medication_schedules_insert_editors"
on public.medication_schedules
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "medication_schedules_update_editors" on public.medication_schedules;
create policy "medication_schedules_update_editors"
on public.medication_schedules
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "medication_checks_select_member" on public.medication_checks;
create policy "medication_checks_select_member"
on public.medication_checks
for select
using (public.is_household_member(household_id));

drop policy if exists "medication_checks_insert_editors" on public.medication_checks;
create policy "medication_checks_insert_editors"
on public.medication_checks
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "medication_checks_update_editors" on public.medication_checks;
create policy "medication_checks_update_editors"
on public.medication_checks
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "supplies_select_member" on public.supplies;
create policy "supplies_select_member"
on public.supplies
for select
using (public.is_household_member(household_id));

drop policy if exists "supplies_insert_editors" on public.supplies;
create policy "supplies_insert_editors"
on public.supplies
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "supplies_update_editors" on public.supplies;
create policy "supplies_update_editors"
on public.supplies
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "vet_visits_select_member" on public.vet_visits;
create policy "vet_visits_select_member"
on public.vet_visits
for select
using (public.is_household_member(household_id));

drop policy if exists "vet_visits_insert_editors" on public.vet_visits;
create policy "vet_visits_insert_editors"
on public.vet_visits
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "vet_visits_update_editors" on public.vet_visits;
create policy "vet_visits_update_editors"
on public.vet_visits
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "vaccines_select_member" on public.vaccines;
create policy "vaccines_select_member"
on public.vaccines
for select
using (public.is_household_member(household_id));

drop policy if exists "vaccines_insert_editors" on public.vaccines;
create policy "vaccines_insert_editors"
on public.vaccines
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "vaccines_update_editors" on public.vaccines;
create policy "vaccines_update_editors"
on public.vaccines
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "documents_select_member" on public.documents;
create policy "documents_select_member"
on public.documents
for select
using (public.is_household_member(household_id));

drop policy if exists "documents_insert_editors" on public.documents;
create policy "documents_insert_editors"
on public.documents
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "documents_update_editors" on public.documents;
create policy "documents_update_editors"
on public.documents
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own"
on public.push_subscriptions
for select
using (user_id = auth.uid());

drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
create policy "push_subscriptions_insert_own"
on public.push_subscriptions
for insert
with check (user_id = auth.uid() and public.is_household_member(household_id));

drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
create policy "push_subscriptions_update_own"
on public.push_subscriptions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own"
on public.push_subscriptions
for delete
using (user_id = auth.uid());

drop policy if exists "reminders_select_member" on public.reminders;
create policy "reminders_select_member"
on public.reminders
for select
using (public.is_household_member(household_id));

drop policy if exists "reminders_insert_editors" on public.reminders;
create policy "reminders_insert_editors"
on public.reminders
for insert
with check (public.can_manage_household(household_id));

drop policy if exists "reminders_update_editors" on public.reminders;
create policy "reminders_update_editors"
on public.reminders
for update
using (public.can_manage_household(household_id))
with check (public.can_manage_household(household_id));

drop policy if exists "storage_select_household_assets" on storage.objects;
create policy "storage_select_household_assets"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('stool-photos', 'documents', 'pet-media', 'prescriptions')
  and public.is_household_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage_insert_household_assets" on storage.objects;
create policy "storage_insert_household_assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('stool-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage_update_household_assets" on storage.objects;
create policy "storage_update_household_assets"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('stool-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id in ('stool-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage_delete_household_assets" on storage.objects;
create policy "storage_delete_household_assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('stool-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
);

revoke execute on function public.complete_signup(text, text, text, text, text) from public;
grant execute on function public.complete_signup(text, text, text, text, text) to authenticated;
