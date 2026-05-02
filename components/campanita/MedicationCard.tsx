"use client";

import { useState } from "react";
import { Archive, AlarmClock, FileText, LoaderCircle, Pill } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatClock, formatShortDate, getAppDateKey } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Medication, MedicationCheck } from "@/types/app";
import type { UserRole } from "@/types/database";

export function MedicationCard({
  medication,
  check,
  role
}: {
  medication: Medication;
  check?: (MedicationCheck & { completed_by_name?: string | null }) | undefined;
  role: UserRole;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canEdit = role === "owner" || role === "caregiver";
  const endedByDate = Boolean(medication.end_date && medication.end_date < getAppDateKey());
  const isFinalized = !medication.active;
  const statusTone = isFinalized
    ? "neutral"
    : endedByDate
      ? "warning"
      : check?.status === "dada"
        ? "success"
        : check?.status === "saltada"
          ? "danger"
          : "secondary";
  const statusLabel = isFinalized ? "finalizada" : endedByDate ? "terminó" : check?.status ?? "pendiente";

  async function handleFinalize() {
    if (!canEdit || saving || isFinalized) return;
    if (!window.confirm("¿Finalizar este tratamiento? Ya no generará nuevos recordatorios.")) return;
    if (isDemoMode) {
      setError("Modo exploración: no se puede finalizar el tratamiento.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: medicationError } = await supabase
      .from("medications")
      .update({ active: false })
      .eq("id", medication.id)
      .eq("household_id", medication.household_id);

    if (medicationError) {
      setSaving(false);
      setError(medicationError.message);
      return;
    }

    const { error: scheduleError } = await supabase
      .from("medication_schedules")
      .update({ active: false })
      .eq("medication_id", medication.id)
      .eq("household_id", medication.household_id);

    setSaving(false);

    if (scheduleError) {
      setError(scheduleError.message);
      return;
    }

    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container/20 text-secondary">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{medication.name}</h3>
            <p className="text-sm text-on-surface-variant">
              {medication.dosage || "Dosis por definir"}{medication.frequency ? ` · ${medication.frequency}` : ""}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {medication.start_date ? `Inicio ${formatShortDate(medication.start_date)}` : "Sin fecha de inicio"}
              {medication.end_date ? ` · Fin ${formatShortDate(medication.end_date)}` : ""}
            </p>
          </div>
        </div>
        <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
      </div>
      {check ? (
        <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          <p className="flex items-center gap-2">
            <AlarmClock className="h-4 w-4" />
            Programada a las {formatClock(check.scheduled_at)}
          </p>
          {check.completed_by_name ? <p className="mt-1">Marcada por {check.completed_by_name}</p> : null}
        </div>
      ) : null}
      {medication.instructions ? (
        <div className="flex items-start gap-2 rounded-2xl bg-primary-container/15 px-4 py-3 text-sm text-on-primary-container">
          <FileText className="mt-0.5 h-4 w-4" />
          <p>{medication.instructions}</p>
        </div>
      ) : null}
      {!isFinalized && canEdit ? (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={handleFinalize} disabled={saving}>
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            Finalizar
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-tertiary">{error}</p> : null}
    </Card>
  );
}
