# Plan: Agenda y Recordatorios de Campanita

## Recomendación

No conviene meter paseos, limpieza, baño, corte de pelo y veterinario dentro de `Medicinas` tal como está hoy. `Medicinas` tiene campos muy específicos de tratamiento: dosis, frecuencia, receta, fecha de inicio/fin y checks de medicina. Si ahí mezclamos todo, la pantalla va a volverse confusa y los datos van a quedar forzados.

La mejor solución es evolucionar `Medicinas` hacia una sección más amplia llamada **Agenda** o **Cuidados**, pero manteniendo tipos internos separados:

- Medicinas
- Citas veterinarias
- Paseos
- Entrenamiento
- Limpieza de ojos
- Limpieza de orejas
- Cepillado
- Baño
- Corte de pelo
- Otro

`Veterinaria` debe quedarse como está conceptualmente: el historial clínico de lo que pasó en consulta, diagnósticos, peso, tratamiento, vacunas y documentos. Es decir, **Agenda programa la cita; Veterinaria documenta la consulta después**.

## Objetivo del cambio

Crear un sistema único de recordatorios calendarizados que sirva para medicinas y rutinas de cuidado, con checks diarios y notificaciones push.

Debe resolver:

- Recordar comidas, medicinas, paseos y cuidados.
- Programar próximas citas veterinarias.
- Marcar tareas como hechas o saltadas.
- Ocultar o archivar tratamientos terminados.
- Mostrar en `Hoy` lo que toca.
- Mantener `Veterinaria` como resumen/historial clínico.

## Modelo propuesto

### Nueva tabla: `care_tasks`

Representa cualquier recordatorio o rutina programada.

Campos sugeridos:

- `id`
- `household_id`
- `pet_id`
- `type`
  - `medication`
  - `vet_appointment`
  - `walk`
  - `training`
  - `eye_cleaning`
  - `ear_cleaning`
  - `brushing`
  - `bath`
  - `grooming`
  - `other`
- `title`
- `description`
- `start_date`
- `end_date`
- `time_of_day`
- `days_of_week`
- `repeat_rule`
  - `once`
  - `daily`
  - `weekly`
  - `monthly`
  - `every_n_days`
- `repeat_interval`
- `reminder_minutes_before`
- `active`
- `created_by`
- `created_at`
- `updated_at`

### Nueva tabla: `care_task_checks`

Representa cada pendiente generado para un día/hora.

Campos sugeridos:

- `id`
- `care_task_id`
- `household_id`
- `pet_id`
- `scheduled_at`
- `completed_at`
- `status`
  - `pendiente`
  - `hecha`
  - `saltada`
- `completed_by`
- `notes`
- `created_at`
- `updated_at`

### Relación con `reminders`

El sistema actual de `reminders` puede seguir usándose. Al crear un check futuro, se crea o actualiza su reminder correspondiente. El endpoint `/api/cron/reminders`, llamado por `cron-job.org`, procesa esos reminders y manda push.

## Cambios por pantalla

### `Hoy`

Agregar una sección:

**Agenda de hoy**

Debe mostrar:

- Medicinas pendientes
- Comidas pendientes
- Rutinas/citas pendientes desde `care_task_checks`

Acciones:

- Marcar como hecha
- Saltar
- Agregar nota

Los próximos recordatorios importantes podrían aparecer también en `Alertas`.

### `Medicinas`

Opción recomendada: renombrar a **Agenda** o **Cuidados**.

Si se quiere mantener el nombre `Medicinas`, entonces dentro debe tener tabs:

- Medicinas
- Rutinas
- Citas

Pero mi recomendación de UX es usar **Agenda** porque describe mejor todo lo que quieres calendarizar.

La pantalla debe permitir crear:

- Medicina con dosis, receta y fecha fin.
- Cita veterinaria con fecha/hora, clínica, motivo y notas.
- Rutina de cuidado con tipo, repetición y recordatorio.

### `Veterinaria`

Mantenerla como historial clínico:

- Nueva consulta
- Diagnóstico
- Tratamiento indicado
- Peso
- Documentos
- Vacunas
- Línea de tiempo

Agregar enlace opcional:

- “Programar próxima cita”

Ese botón crea un `care_task` tipo `vet_appointment`, no una consulta clínica.

## Tratamientos terminados

Actualmente las medicinas tienen `end_date` y `active`, pero no hay una acción clara para quitarlas.

Cambios necesarios:

- En `MedicationCard`, agregar botón `Finalizar`.
- Al finalizar:
  - `medications.active = false`
  - `medication_schedules.active = false`
- En la lista principal mostrar solo medicinas activas.
- Agregar un bloque colapsable o filtro: `Tratamientos finalizados`.

Regla automática opcional:

- Si `end_date < hoy`, mostrar badge `Tratamiento terminado`.
- No desactivarlo automáticamente sin confirmación, porque a veces un tratamiento se extiende.

## Fases de implementación

### Fase 1: Ordenar medicinas terminadas

Objetivo: resolver el problema actual sin rediseñar todo.

Tareas:

- Agregar botón `Finalizar` en `MedicationCard`.
- Desactivar medicina y horarios asociados.
- Filtrar `Medicinas activas`.
- Mostrar `Tratamientos finalizados`.
- Ajustar checks para no generar nuevos pendientes si la medicina está inactiva o terminó.

Resultado:

- La pantalla de medicinas deja de acumular tratamientos viejos.

### Fase 2: Crear tabla de agenda de cuidados

Objetivo: soportar paseos, limpieza, baño, grooming y citas.

Tareas:

- Crear migración `care_tasks`.
- Crear migración `care_task_checks`.
- Agregar policies RLS.
- Agregar tipos TypeScript.
- Agregar generación de checks diarios/semanales.
- Integrar con `reminders`.

Resultado:

- La app puede calendarizar cualquier rutina.

### Fase 3: UI de Agenda/Cuidados

Objetivo: crear una experiencia clara.

Tareas:

- Crear pantalla `/agenda` o reemplazar `/medicinas` por una vista con tabs.
- Formulario de nueva rutina/cita.
- Lista de próximos pendientes.
- Lista de rutinas activas.
- Filtros por tipo.

Resultado:

- La familia puede administrar todas las rutinas en un solo lugar.

### Fase 4: Integración con Hoy

Objetivo: que lo importante aparezca donde se usa diario.

Tareas:

- Mostrar `care_task_checks` en `Hoy`.
- Reutilizar `PendingTaskCard` o crear `CareTaskCard`.
- Permitir `hecha`, `saltada`, `nota`.
- Mostrar próximos 3 recordatorios.

Resultado:

- `Hoy` se vuelve la agenda diaria real de Campanita.

### Fase 5: Veterinaria como historial clínico

Objetivo: separar programación de documentación.

Tareas:

- En `Veterinaria`, agregar botón “Programar próxima cita”.
- Mantener `Nueva consulta` para registrar lo que ocurrió.
- En visitas pasadas, mostrar si hubo cita programada relacionada.

Resultado:

- No se mezcla “tengo cita el lunes” con “esto diagnosticó la veterinaria”.

## Decisión recomendada

Implementar primero Fase 1 y Fase 2.

Orden sugerido:

1. Finalizar medicinas y ocultar tratamientos terminados.
2. Crear `care_tasks` y `care_task_checks`.
3. Agregar sección `Agenda` dentro de `Más`.
4. Mostrar pendientes de agenda en `Hoy`.
5. Evaluar si `Medicinas` se renombra a `Agenda` o queda como tab dentro de Agenda.

## Nota sobre notificaciones

La estrategia actual con `cron-job.org` cada 5 minutos funciona para este plan. El cron debe revisar:

- `meal_checks`
- `medication_checks`
- `care_task_checks`
- `reminders` pendientes

La app no necesita Vercel Pro para esto mientras el endpoint siga protegido con `CRON_SECRET`.
