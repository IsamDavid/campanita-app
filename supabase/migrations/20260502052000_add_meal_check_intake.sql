alter table public.meal_checks
add column if not exists intake text
check (intake is null or intake in ('bien', 'poco', 'nada'));

notify pgrst, 'reload schema';
