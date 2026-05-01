"use client";

import { AlertTriangle, BellRing, Syringe } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { QuickActions } from "@/components/campanita/QuickActions";
import { PendingTaskCard } from "@/components/campanita/PendingTaskCard";
import { FamilyActivity } from "@/components/campanita/FamilyActivity";
import type { AppContext, DayCheckItem, FamilyActivityItem } from "@/types/app";

export function TodayDashboard({
  context,
  checks,
  alerts,
  activity,
  todayLabel
}: {
  context: AppContext;
  checks: DayCheckItem[];
  alerts: Array<{ id: string; tone: string; title: string; description: string }>;
  activity: FamilyActivityItem[];
  todayLabel: string;
}) {
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
                <div>
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-sm text-on-surface-variant">{alert.description}</p>
                </div>
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
