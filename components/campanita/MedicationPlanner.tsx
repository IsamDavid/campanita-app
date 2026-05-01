"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { MedicationCard } from "@/components/campanita/MedicationCard";
import { PendingTaskCard } from "@/components/campanita/PendingTaskCard";
import { RealtimeRefresh } from "@/components/campanita/RealtimeRefresh";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isDemoMode } from "@/lib/demo";
import { buildStoragePath, STORAGE_BUCKETS } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { medicationSchema } from "@/lib/validations";
import type { AppContext, Medication, MedicationCheck } from "@/types/app";

const weekdays = [
  { value: 0, label: "D" },
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "M" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" }
];

export function MedicationPlanner({
  context,
  medications,
  checks
}: {
  context: AppContext;
  medications: Medication[];
  checks: Array<MedicationCheck & { completed_by_name?: string | null }>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("10:00");
  const [reminderMinutes, setReminderMinutes] = useState("0");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const medicationMap = useMemo(
    () => new Map(medications.map((item) => [item.id, item])),
    [medications]
  );

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!context.pet) return;

    const parsed = medicationSchema.safeParse({
      name,
      dosage,
      frequency,
      instructions,
      start_date: startDate,
      end_date: endDate,
      time_of_day: timeOfDay,
      reminder_minutes_before: reminderMinutes,
      days_of_week: daysOfWeek
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Verifica la medicina.");
      return;
    }

    if (isDemoMode) {
      setError("Modo exploracion: el guardado de medicinas esta desactivado.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    let prescriptionPath: string | null = null;

    if (file) {
      prescriptionPath = buildStoragePath({
        householdId: context.household.id,
        petId: context.pet.id,
        category: "prescriptions",
        fileName: file.name
      });
      const upload = await supabase.storage
        .from(STORAGE_BUCKETS.prescriptions)
        .upload(prescriptionPath, file, { upsert: false });

      if (upload.error) {
        setSaving(false);
        setError(upload.error.message);
        return;
      }
    }

    const { data: medication, error: medicationError } = await supabase
      .from("medications")
      .insert({
        household_id: context.household.id,
        pet_id: context.pet.id,
        name,
        dosage,
        frequency,
        instructions,
        start_date: startDate,
        end_date: endDate || null,
        prescription_photo_url: prescriptionPath,
        active: true,
        created_by: context.userId
      })
      .select("id")
      .single();

    if (medicationError || !medication) {
      setSaving(false);
      setError(medicationError?.message ?? "No se pudo guardar la medicina.");
      return;
    }

    const { error: scheduleError } = await supabase.from("medication_schedules").insert({
      medication_id: medication.id,
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
    setDosage("");
    setFrequency("");
    setInstructions("");
    setEndDate("");
    setFile(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <RealtimeRefresh householdId={context.household.id} tables={["medication_checks", "medications", "medication_schedules"]} />

      <Card>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Nueva medicina</h2>
              <p className="text-sm text-on-surface-variant">Incluye dosis, fechas y horario.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Guardar
            </Button>
          </div>

          <FormField label="Nombre">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enrofloxacina" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Dosis">
              <Input value={dosage} onChange={(event) => setDosage(event.target.value)} placeholder="1/2 pastilla" />
            </FormField>
            <FormField label="Frecuencia">
              <Input value={frequency} onChange={(event) => setFrequency(event.target.value)} placeholder="Cada 12 horas" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Inicio">
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </FormField>
            <FormField label="Fin">
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
          <FormField label="Días">
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => {
                const active = daysOfWeek.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    className={`h-10 w-10 rounded-full text-sm font-semibold ${
                      active ? "bg-secondary text-on-secondary" : "bg-surface-container-low text-on-surface-variant"
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
          <FormField label="Instrucciones">
            <Textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Dar con comida" />
          </FormField>
          <FormField label="Foto de receta" hint="Opcional">
            <Input type="file" accept="image/*,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </FormField>
          {error ? <p className="text-sm text-tertiary">{error}</p> : null}
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Checks de hoy</h2>
        {checks.length ? (
          <div className="space-y-3">
            {checks.map((check) => {
              const medication = medicationMap.get(check.medication_id);
              if (!medication) return null;

              return (
                <PendingTaskCard
                  key={check.id}
                  userId={context.userId}
                  role={context.role}
                  item={{
                    id: check.id,
                    type: "medication",
                    title: medication.name,
                    subtitle: [check.scheduled_at.slice(11, 16), medication.dosage].filter(Boolean).join(" • "),
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
            title="Sin checks de medicina"
            description="Los pendientes aparecerán aquí según el horario registrado."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Medicinas activas</h2>
        {medications.length ? (
          <div className="space-y-3">
            {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                check={checks.find((item) => item.medication_id === medication.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin tratamientos"
            description="Registra antibióticos, suplementos o recetas para comenzar el seguimiento."
          />
        )}
      </section>
    </div>
  );
}
