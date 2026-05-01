import { AlarmClock, FileText, Pill } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatClock } from "@/lib/dates";
import type { Medication, MedicationCheck } from "@/types/app";

export function MedicationCard({
  medication,
  check
}: {
  medication: Medication;
  check?: (MedicationCheck & { completed_by_name?: string | null }) | undefined;
}) {
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
          </div>
        </div>
        <StatusBadge
          tone={
            check?.status === "dada"
              ? "success"
              : check?.status === "saltada"
                ? "danger"
                : "secondary"
          }
        >
          {check?.status ?? "pendiente"}
        </StatusBadge>
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
    </Card>
  );
}
