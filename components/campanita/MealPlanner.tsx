"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { MealCard } from "@/components/campanita/MealCard";
import { PendingTaskCard } from "@/components/campanita/PendingTaskCard";
import { RealtimeRefresh } from "@/components/campanita/RealtimeRefresh";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isDemoMode } from "@/lib/demo";
import { mealSchema } from "@/lib/validations";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { AppContext, Meal, MealCheck } from "@/types/app";

const weekdays = [
  { value: 0, label: "D" },
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" }
];

export function MealPlanner({
  context,
  meals,
  checks
}: {
  context: AppContext;
  meals: Meal[];
  checks: Array<MealCheck & { completed_by_name?: string | null }>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [preparation, setPreparation] = useState("");
  const [notes, setNotes] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("08:00");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mealsById = useMemo(() => new Map(meals.map((meal) => [meal.id, meal])), [meals]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!context.pet) return;

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
      setError("Modo exploracion: el guardado de comidas esta desactivado.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();

    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .insert({
        household_id: context.household.id,
        pet_id: context.pet.id,
        name,
        food_type: foodType,
        quantity,
        preparation,
        notes,
        active: true,
        created_by: context.userId
      })
      .select("id")
      .single();

    if (mealError || !meal) {
      setSaving(false);
      setError(mealError?.message ?? "No se pudo guardar la comida.");
      return;
    }

    const { error: scheduleError } = await supabase.from("meal_schedules").insert({
      meal_id: meal.id,
      household_id: context.household.id,
      pet_id: context.pet.id,
      time_of_day: timeOfDay,
      days_of_week: daysOfWeek,
      reminder_minutes_before: Number(reminderMinutes),
      active: true
    });

    setSaving(false);

    if (scheduleError) {
      setError(scheduleError.message);
      return;
    }

    setName("");
    setFoodType("");
    setQuantity("");
    setPreparation("");
    setNotes("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <RealtimeRefresh householdId={context.household.id} tables={["meal_checks", "meals", "meal_schedules"]} />

      <Card>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Nueva comida</h2>
              <p className="text-sm text-on-surface-variant">Registra preparación y horario.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Guardar
            </Button>
          </div>

          <FormField label="Nombre">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Desayuno" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo">
              <Input value={foodType} onChange={(event) => setFoodType(event.target.value)} placeholder="Croquetas + caldo" />
            </FormField>
            <FormField label="Cantidad">
              <Input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="150 g" />
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
          <FormField label="Preparación">
            <Textarea value={preparation} onChange={(event) => setPreparation(event.target.value)} placeholder="Mezclar con caldo tibio" />
          </FormField>
          <FormField label="Notas">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opcional" />
          </FormField>
          {error ? <p className="text-sm text-tertiary">{error}</p> : null}
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Checks de hoy</h2>
        {checks.length ? (
          <div className="space-y-3">
            {checks.map((check) => {
              const meal = mealsById.get(check.meal_id);
              if (!meal) return null;

              return (
                <PendingTaskCard
                  key={check.id}
                  userId={context.userId}
                  role={context.role}
                  item={{
                    id: check.id,
                    type: "meal",
                    title: meal.name,
                    subtitle: [check.scheduled_at.slice(11, 16), meal.quantity].filter(Boolean).join(" • "),
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
          <EmptyState
            title="Aún no hay checks"
            description="Al guardar una comida con horario se generará el pendiente del día."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Comidas activas</h2>
        {meals.length ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                check={checks.find((item) => item.meal_id === meal.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin plan de comidas"
            description="Registra desayuno, comida y cena para empezar a marcar pendientes."
          />
        )}
      </section>
    </div>
  );
}
