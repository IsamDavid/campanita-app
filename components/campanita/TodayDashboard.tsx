"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BellRing, Syringe, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { QuickActions } from "@/components/campanita/QuickActions";
import { PendingTaskCard } from "@/components/campanita/PendingTaskCard";
import { FamilyActivity } from "@/components/campanita/FamilyActivity";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo";
import { STORAGE_BUCKETS } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { AlertItem, AppContext, DayCheckItem, FamilyActivityItem } from "@/types/app";

export function TodayDashboard({
  context,
  checks,
  alerts,
  activity,
  todayLabel
}: {
  context: AppContext;
  checks: DayCheckItem[];
  alerts: AlertItem[];
  activity: FamilyActivityItem[];
  todayLabel: string;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canManage = context.role === "owner" || context.role === "caregiver";

  async function deleteAlert(alert: AlertItem) {
    if (!alert.recordId || alert.recordType !== "symptom" || !canManage) return;
    if (isDemoMode) {
      setError("Modo exploracion: el borrado de alertas esta desactivado.");
      return;
    }

    const confirmed = window.confirm("¿Eliminar este registro rápido?");
    if (!confirmed) return;

    setDeletingId(alert.id);
    setError(null);

    const supabase = getSupabaseBrowserClient();

    const { error: deleteError } = await supabase
      .from("symptom_logs")
      .delete()
      .eq("id", alert.recordId)
      .eq("household_id", context.household.id);

    if (deleteError) {
      setDeletingId(null);
      setError(deleteError.message);
      return;
    }

    if (alert.photoPath) {
      await supabase.storage.from(STORAGE_BUCKETS.symptomPhotos).remove([alert.photoPath]);
    }

    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-on-surface-variant">
            Hoy · {todayLabel}
          </p>
          <h2 className="mt-1 text-3xl font-extrabold">Panel del día</h2>
        </div>
        <Card className="bg-[linear-gradient(135deg,rgba(143,185,150,0.18),rgba(255,255,255,0.9),rgba(183,180,254,0.16))]">
          <p className="text-sm text-on-surface-variant">
            Pendientes visibles para toda la familia. Los cambios se refrescan casi en tiempo real.
          </p>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Pendientes de hoy</h2>
          <span className="pill-chip bg-primary-container/20 text-primary">
            {checks.length} items
          </span>
        </div>
        {checks.length ? (
          <div className="space-y-3">
            {checks.map((item) => (
              <PendingTaskCard key={item.id} item={item} userId={context.userId} role={context.role} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay pendientes para hoy"
            description="Cuando registres horarios de comida o medicinas aparecerán aquí."
          />
        )}
      </section>

      <QuickActions context={context} />

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Alertas</h2>
        {error ? <p className="text-sm text-tertiary">{error}</p> : null}
        {alerts.length ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary-fixed/50 text-tertiary">
                  {alert.tone === "calm" ? (
                    <Syringe className="h-5 w-5" />
                  ) : alert.tone === "urgent" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <BellRing className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-sm text-on-surface-variant">{alert.description}</p>
                  {alert.photoUrl ? (
                    <img
                      src={alert.photoUrl}
                      alt=""
                      className="mt-3 aspect-video w-full rounded-2xl object-cover"
                    />
                  ) : null}
                </div>
                {alert.canDelete && canManage ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-10 shrink-0 rounded-2xl px-3 py-2 text-tertiary"
                    onClick={() => deleteAlert(alert)}
                    disabled={deletingId === alert.id}
                    aria-label="Eliminar alerta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin alertas críticas"
            description="Las vacunas próximas, insumos bajos o medicinas por terminar aparecerán aquí."
            icon="bone"
          />
        )}
      </section>

      <FamilyActivity items={activity} />
    </div>
  );
}
