alter table public.stool_logs
add column if not exists optimized_photo_url text;

notify pgrst, 'reload schema';
