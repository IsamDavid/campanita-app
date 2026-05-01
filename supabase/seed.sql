-- Reemplaza los UUID antes de ejecutar.
-- 1) Crea un usuario real en Auth.
-- 2) Sustituye el UUID de abajo por el de ese usuario.

begin;

insert into public.profiles (id, full_name)
values ('11111111-1111-1111-1111-111111111111', 'Ana')
on conflict (id) do nothing;

insert into public.households (id, name, created_by)
values (
  '22222222-2222-2222-2222-222222222222',
  'Familia Campanita',
  '11111111-1111-1111-1111-111111111111'
)
on conflict (id) do nothing;

update public.households
set invite_code = 'CAMPA123'
where id = '22222222-2222-2222-2222-222222222222';

insert into public.household_members (id, household_id, user_id, role)
values (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'owner'
)
on conflict (household_id, user_id) do nothing;

insert into public.pets (id, household_id, name, species, breed)
values (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'Campanita',
  'Perro',
  'Mestiza'
)
on conflict (id) do nothing;

insert into public.meals (
  household_id,
  pet_id,
  name,
  food_type,
  quantity,
  preparation,
  active,
  created_by
)
values (
  '22222222-2222-2222-2222-222222222222',
  '44444444-4444-4444-4444-444444444444',
  'Desayuno',
  'Croquetas con caldo',
  '150 g',
  'Mezclar con agua tibia',
  true,
  '11111111-1111-1111-1111-111111111111'
);

insert into public.medications (
  household_id,
  pet_id,
  name,
  dosage,
  frequency,
  instructions,
  start_date,
  end_date,
  active,
  created_by
)
values (
  '22222222-2222-2222-2222-222222222222',
  '44444444-4444-4444-4444-444444444444',
  'Enrofloxacina',
  '1/2 pastilla',
  'Cada 12 horas',
  'Dar con comida',
  current_date,
  current_date + interval '7 days',
  true,
  '11111111-1111-1111-1111-111111111111'
);

commit;
