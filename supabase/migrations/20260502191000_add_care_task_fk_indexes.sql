create index if not exists idx_care_tasks_pet_id on public.care_tasks (pet_id);
create index if not exists idx_care_tasks_created_by on public.care_tasks (created_by);
create index if not exists idx_care_task_checks_pet_id on public.care_task_checks (pet_id);
create index if not exists idx_care_task_checks_completed_by on public.care_task_checks (completed_by);
