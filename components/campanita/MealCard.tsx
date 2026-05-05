"use client";

import { useState } from "react";
import { Archive, Clock3, CookingPot, LoaderCircle, Pencil, RotateCcw, Save, Utensils, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { formatClock } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { mealSchema } from "@/lib/validations";
import type { Meal, MealCheck, MealSchedule } from "@/types/app";
import type { UserRole } from "@/types/database";

const weekdays = [
  { value: 0, label: "D" },
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" }
];

function normalizeTime(time?: string | null) {
  return (time ?? "08:00").slice(0, 5);
}

function daysLabel(days: number[]) {
  if (days.length === 7) return "Todos los días";
  return weekdays.filter((day) => days.includes(day.value)).map((day) => day.label).join(" ") || "Sin días";
}

async function cancelPendingMealReminders(scheduleIds: string[], householdId: string) {
  if (!scheduleIds.length) return null;

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("reminders")
    .update({ status: "cancelled" })
    .eq("household_id", householdId)
    .eq("type", "meal")
    .eq("status", "pending")
    .in("related_id", scheduleIds);

  return error;
}

export function MealCard({
  meal,
  schedule,
  check,
  role
}: {
  meal: Meal;
  schedule?: MealSchedule | undefined;
  check?: (MealCheck & { completed_by_name?: string | null }) | undefined;
  role: UserRole;
}) {
  const router = useRouter();
  const canEdit = role === "owner" || role === "caregiver";
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(meal.name);
  const [foodType, setFoodType] = useState(meal.food_type ?? "");
  const [quantity, setQuantity] = useState(meal.quantity ?? "");
  const [preparation, setPreparation] = useState(meal.preparation ?? "");
  const [notes, setNotes] = useState(meal.notes ?? "");
  const [timeOfDay, setTimeOfDay] = useState(normalizeTime(schedule?.time_of_day));
  const [reminderMinutes, setReminderMinutes] = useState(String(schedule?.reminder_minutes_before ?? 0));
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(schedule?.days_of_week ?? [1, 2, 3, 4, 5, 6, 0]);
  const isActive = meal.active && (schedule?.active ?? true);
  const statusTone = !isActive
    ? "neutral"
    : check?.status === "dada"
      ? "success"
      : check?.status === "saltada"
        ? "danger"
        : "secondary";
  const statusLabel = !isActive ? "pausada" : check?.status ?? "activa";

  function resetForm() {
    setName(meal.name);
    setFoodType(meal.food_type ?? "");
    setQuantity(meal.quantity ?? "");
    setPreparation(meal.preparation ?? "");
    setNotes(meal.notes ?? "");
    setTimeOfDay(normalizeTime(schedule?.time_of_day));
    setReminderMinutes(String(schedule?.reminder_minutes_before ?? 0));
    setDaysOfWeek(schedule?.days_of_week ?? [1, 2, 3, 4, 5, 6, 0]);
    setError(null);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || saving) return;

    const parsed = mealSchema.safeParse({
      name,
      food_type: foodType,
      quantity,
      preparation,
      notes,
      time_of_day: timeOfDay,
      reminder_minutes_before: reminderMinutes,
      days_of_week: daysOfWeek
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Verifica la comida.");
      return;
    }

    if (isDemoMode) {
      setError("Modo exploración: no se pueden editar comidas.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();

    const { error: mealError } = await supabase
      .from("meals")
      .update({
        name,
        food_type: foodType,
        quantity,
        preparation,
        notes,
        active: true
      })
      .eq("id", meal.id)
      .eq("household_id", meal.household_id);

    if (mealError) {
      setSaving(false);
      setError(mealError.message);
      return;
    }

    if (schedule) {
      const { error: scheduleError } = await supabase
        .from("meal_schedules")
        .update({
          time_of_day: timeOfDay,
          days_of_week: daysOfWeek,
          reminder_minutes_before: Number(reminderMinutes),
          active: true
        })
        .eq("id", schedule.id)
        .eq("household_id", meal.household_id);

      if (scheduleError) {
        setSaving(false);
        setError(scheduleError.message);
        return;
      }

      const remindersError = await cancelPendingMealReminders([schedule.id], meal.household_id);
      if (remindersError) {
        setSaving(false);
        setError(remindersError.message);
        return;
      }
    } else {
      const { error: scheduleError } = await supabase.from("meal_schedules").insert({
        meal_id: meal.id,
        household_id: meal.household_id,
        pet_id: meal.pet_id,
        time_of_day: timeOfDay,
        days_of_week: daysOfWeek,
        reminder_minutes_before: Number(reminderMinutes),
        active: true
      });

      if (scheduleError) {
        setSaving(false);
        setError(scheduleError.message);
        return;
      }
    }

    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleToggleActive() {
    if (!canEdit || saving) return;
    const nextActive = !isActive;
    const message = nextActive
      ? "¿Reactivar esta comida y volver a generar recordatorios?"
      : "¿Pausar esta comida? Se cancelarán sus recordatorios pendientes.";
    if (!window.confirm(message)) return;

    if (isDemoMode) {
      setError("Modo exploración: no se puede modificar esta comida.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();

    const { error: mealError } = await supabase
      .from("meals")
      .update({ active: nextActive })
      .eq("id", meal.id)
      .eq("household_id", meal.household_id);

    if (mealError) {
      setSaving(false);
      setError(mealError.message);
      return;
    }

    const { data: schedules, error: schedulesError } = await supabase
      .from("meal_schedules")
      .select("id")
      .eq("meal_id", meal.id)
      .eq("household_id", meal.household_id);

    if (schedulesError) {
      setSaving(false);
      setError(schedulesError.message);
      return;
    }

    const scheduleIds = (schedules ?? []).map((item) => item.id);
    if (scheduleIds.length) {
      const { error: scheduleError } = await supabase
        .from("meal_schedules")
        .update({ active: nextActive })
        .eq("meal_id", meal.id)
        .eq("household_id", meal.household_id);

      if (scheduleError) {
        setSaving(false);
        setError(scheduleError.message);
        return;
      }

      if (!nextActive) {
        const remindersError = await cancelPendingMealReminders(scheduleIds, meal.household_id);
        if (remindersError) {
          setSaving(false);
          setError(remindersError.message);
          return;
        }
      }
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{meal.name}</h3>
            <p className="text-sm text-on-surface-variant">
              {meal.food_type || "Comida"}{meal.quantity ? ` · ${meal.quantity}` : ""}
            </p>
            {schedule ? (
              <p className="mt-1 text-xs text-on-surface-variant">
                {normalizeTime(schedule.time_of_day)} · {daysLabel(schedule.days_of_week)} · aviso {schedule.reminder_minutes_before} min antes
              </p>
            ) : null}
          </div>
        </div>
        <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
      </div>

      {check ? (
        <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          <p className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            Programada a las {formatClock(check.scheduled_at)}
          </p>
          {check.completed_by_name ? <p className="mt-1">Marcada por {check.completed_by_name}</p> : null}
          {check.intake ? <p className="mt-1">Comió {check.intake}</p> : null}
        </div>
      ) : null}

      {meal.preparation ? (
        <div className="flex items-start gap-2 rounded-2xl bg-secondary-container/15 px-4 py-3 text-sm text-on-secondary-container">
          <CookingPot className="mt-0.5 h-4 w-4" />
          <p>{meal.preparation}</p>
        </div>
      ) : null}

      {editing ? (
        <form className="space-y-4 rounded-[1.4rem] bg-surface-container-low p-4" onSubmit={handleSave}>
          <FormField label="Nombre">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo">
              <Input value={foodType} onChange={(event) => setFoodType(event.target.value)} />
            </FormField>
            <FormField label="Cantidad">
              <Input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="150 g" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Hora">
              <Input type="time" value={timeOfDay} onChange={(event) => setTimeOfDay(event.target.value)} />
            </FormField>
            <FormField label="Aviso antes (min)">
              <Input value={reminderMinutes} onChange={(event) => setReminderMinutes(event.target.value)} inputMode="numeric" />
            </FormField>
          </div>
          <FormField label="Días">
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => {
                const active = daysOfWeek.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    className={`h-10 w-10 rounded-full text-sm font-semibold ${
                      active ? "bg-primary text-on-primary" : "bg-white text-on-surface-variant"
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
          <FormField label="Preparación">
            <Textarea value={preparation} onChange={(event) => setPreparation(event.target.value)} />
          </FormField>
          <FormField label="Notas">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                setEditing(false);
              }}
              disabled={saving}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      ) : null}

      {canEdit ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setEditing((value) => !value)} disabled={saving}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button type="button" variant="secondary" onClick={handleToggleActive} disabled={saving}>
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : isActive ? (
              <Archive className="h-4 w-4" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {isActive ? "Pausar" : "Reactivar"}
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-tertiary">{error}</p> : null}
    </Card>
  );
}
