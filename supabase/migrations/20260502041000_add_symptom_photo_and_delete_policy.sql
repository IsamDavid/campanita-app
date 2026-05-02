alter table if exists public.symptom_logs
add column if not exists photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'symptom-photos',
  'symptom-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "symptom_logs_delete_editors" on public.symptom_logs;
create policy "symptom_logs_delete_editors"
on public.symptom_logs
for delete
using (public.can_manage_household(household_id));

drop policy if exists "storage_select_household_assets" on storage.objects;
create policy "storage_select_household_assets"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('stool-photos', 'symptom-photos', 'documents', 'pet-media', 'prescriptions')
  and public.is_household_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage_insert_household_assets" on storage.objects;
create policy "storage_insert_household_assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('stool-photos', 'symptom-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage_update_household_assets" on storage.objects;
create policy "storage_update_household_assets"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('stool-photos', 'symptom-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id in ('stool-photos', 'symptom-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "storage_delete_household_assets" on storage.objects;
create policy "storage_delete_household_assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('stool-photos', 'symptom-photos', 'documents', 'pet-media', 'prescriptions')
  and public.can_manage_household(((storage.foldername(name))[1])::uuid)
);
