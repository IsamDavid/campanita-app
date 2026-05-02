"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, LoaderCircle, Plus, Power } from "lucide-react";
import { useRouter } from "next/navigation";

import { PendingTaskCard } from "@/components/campanita/PendingTaskCard";
import { RealtimeRefresh } from "@/components/campanita/RealtimeRefresh";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCareTaskType } from "@/lib/care";
import { formatClock, getAppDateKey } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { careTaskSchema } from "@/lib/validations";
import type { AppContext, CareTask, CareTaskCheck } from "@/types/app";
import type { CareRepeatRule, CareTaskType } from "@/types/database";

const weekdays = [
  { value: 0, label: "D" },
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" }
];

const taskTypes: Array<{ value: CareTaskType; label: string }> = [
  { value: "vet_appointment", label: "Cita veterinaria" },
  { value: "walk", label: "Paseo" },
  { value: "training", label: "Entrenamiento" },
  { value: "eye_cleaning", label: "Limpieza de ojos" },
  { value: "ear_cleaning", label: "Limpieza de orejas" },
  { value: "brushing", label: "Cepillado" },
  { value: "bath", label: "Baño" },
  { value: "grooming", label: "Corte de pelo" },
  { value: "other", label: "Otro" }
];

const repeatRules: Array<{ value: CareRepeatRule; label: string }> = [
  { value: "once", label: "Una vez" },
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "every_n_days", label: "Cada ciertos días" }
];

function repeatLabel(task: CareTask) {
  if (task.repeat_rule === "once") return `Una vez: ${task.start_date}`;
  if (task.repeat_rule === "daily") return "Diario";
  if (task.repeat_rule === "weekly") return "Semanal";
  if (task.repeat_rule === "monthly") return "Mensual";
  return `Cada ${task.repeat_interval} días`;
}

function normalizeInitialType(value?: string): CareTaskType {
  return taskTypes.some((item) => item.value === value) ? (value as CareTaskType) : "walk";
}

export function AgendaManager({
  context,
  tasks,
  checks,
  initialType
}: {
  context: AppContext;
  tasks: CareTask[];
  checks: Array<CareTaskCheck & { completed_by_name?: string | null }>;
  initialType?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<CareTaskType>(normalizeInitialType(initialType));
  const [title, setTitle] = useState(initialType === "vet_appointment" ? "Cita veterinaria" : "");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(getAppDateKey(new Date()));
  const [endDate, setEndDate] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("10:00");
  const [repeatRule, setRepeatRule] = useState<CareRepeatRule>(initialType === "vet_appointment" ? "once" : "weekly");
  const [repeatInterval, setRepeatInterval] = useState("1");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [saving, setSaving] = useState(false);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const activeTasks = useMemo(() => tasks.filter((task) => task.active), [tasks]);
  const inactiveTasks = useMemo(() => tasks.filter((task) => !task.active), [tasks]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!context.pet) return;

    const parsed = careTaskSchema.safeParse({
      type,
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      time_of_day: timeOfDay,
      days_of_week: repeatRule === "weekly" ? daysOfWeek : [],
      repeat_rule: repeatRule,
      repeat_interval: repeatInterval,
      reminder_minutes_before: reminderMinutes
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Verifica la tarea.");
      return;
    }

    if (isDemoMode) {
      setError("Modo exploracion: el guardado de agenda esta desactivado.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("care_tasks").insert({
      household_id: context.household.id,
      pet_id: context.pet.id,
      type,
      title,
      description,
      start_date: startDate,
      end_date: endDate || null,
      time_of_day: timeOfDay,
      days_of_week: repeatRule === "weekly" ? daysOfWeek : [],
      repeat_rule: repeatRule,
      repeat_interval: Number(repeatInterval),
      reminder_minutes_before: Number(reminderMinutes),
      active: true,
      created_by: context.userId
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setDescription("");
    setEndDate("");
    router.refresh();
  }

  async function pauseTask(taskId: string) {
    if (isDemoMode) {
      setError("Modo exploracion: pausar agenda esta desactivado.");
      return;
    }

    setPausingId(taskId);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("care_tasks")
      .update({ active: false })
      .eq("id", taskId)
      .eq("household_id", context.household.id);

    setPausingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      <RealtimeRefresh householdId={context.household.id} tables={["care_task_checks", "care_tasks"]} />

      <Card>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Nueva agenda</h2>
              <p className="text-sm text-on-surface-variant">Citas, paseos y cuidados con recordatorio.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Guardar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo">
              <Select value={type} onChange={(event) => setType(event.target.value as CareTaskType)}>
                {taskTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Nombre">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Limpieza de ojos" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Inicio">
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </FormField>
            <FormField label="Fin" hint="Opcional">
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Hora">
              <Input type="time" value={timeOfDay} onChange={(event) => setTimeOfDay(event.target.value)} />
            </FormField>
            <FormField label="Recordatorio antes (min)">
              <Input value={reminderMinutes} onChange={(event) => setReminderMinutes(event.target.value)} inputMode="numeric" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Repetición">
              <Select value={repeatRule} onChange={(event) => setRepeatRule(event.target.value as CareRepeatRule)}>
                {repeatRules.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Intervalo">
              <Input value={repeatInterval} onChange={(event) => setRepeatInterval(event.target.value)} inputMode="numeric" />
            </FormField>
          </div>

          {repeatRule === "weekly" ? (
            <FormField label="Días">
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => {
                  const active = daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      className={`h-10 w-10 rounded-full text-sm font-semibold ${
                        active ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant"
                      }`}
                      onClick={() =>
                        setDaysOfWeek((current) =>
                          current.includes(day.value)
                            ? current.filter((value) => value !== day.value)
                            : [...current, day.value]
                        )
                      }
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </FormField>
          ) : null}

          <FormField label="Notas">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Opcional" />
          </FormField>
          {error ? <p className="text-sm text-tertiary">{error}</p> : null}
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Checks de hoy</h2>
        {checks.length ? (
          <div className="space-y-3">
            {checks.map((check) => {
              const task = tasksById.get(check.care_task_id);
              if (!task) return null;

              return (
                <PendingTaskCard
                  key={check.id}
                  userId={context.userId}
                  role={context.role}
                  item={{
                    id: check.id,
                    type: "care",
                    title: task.title,
                    subtitle: [formatClock(check.scheduled_at), formatCareTaskType(task.type)].join(" • "),
                    scheduledAt: check.scheduled_at,
                    status: check.status,
                    checkId: check.id,
                    notes: check.notes,
                    completedAt: check.completed_at ?? undefined,
                    completedByName: check.completed_by_name
                  }}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState title="Sin agenda para hoy" description="Los cuidados programados aparecerán aquí." />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Agenda activa</h2>
        {activeTasks.length ? (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <Card key={task.id} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
                  <CalendarPlus className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-on-surface-variant">
                    {[formatCareTaskType(task.type), task.time_of_day.slice(0, 5), repeatLabel(task)]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                  {task.description ? <p className="mt-2 text-sm text-on-surface-variant">{task.description}</p> : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-10 shrink-0 rounded-2xl px-3 py-2 text-xs"
                  onClick={() => pauseTask(task.id)}
                  disabled={pausingId === task.id}
                >
                  <Power className="h-4 w-4" />
                  Pausar
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Sin agenda activa" description="Crea una tarea para registrar cuidados fuera de comidas y medicinas." />
        )}
      </section>

      {inactiveTasks.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Pausadas</h2>
          <div className="space-y-3">
            {inactiveTasks.map((task) => (
              <Card key={task.id}>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-on-surface-variant">{formatCareTaskType(task.type)}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
