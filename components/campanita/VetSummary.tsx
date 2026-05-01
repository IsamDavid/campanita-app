import { Pill, Stethoscope, Syringe, TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/card";

export function VetSummary({
  stoolCount,
  abnormalStools,
  activeMedications,
  visitCount,
  vaccineCount
}: {
  stoolCount: number;
  abnormalStools: number;
  activeMedications: number;
  visitCount: number;
  vaccineCount: number;
}) {
  const items = [
    { label: "Heces registradas", value: stoolCount, icon: TriangleAlert, tone: "text-tertiary" },
    { label: "Medicinas activas", value: activeMedications, icon: Pill, tone: "text-secondary" },
    { label: "Consultas", value: visitCount, icon: Stethoscope, tone: "text-primary" },
    { label: "Vacunas", value: vaccineCount, icon: Syringe, tone: "text-primary" }
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Resumen clínico</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="space-y-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-container-low ${item.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{item.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{item.value}</p>
              </div>
            </Card>
          );
        })}
      </div>
      {abnormalStools > 0 ? (
        <Card className="bg-tertiary-fixed/30 text-on-tertiary-container">
          <p className="font-semibold">Atención digestiva</p>
          <p className="mt-1 text-sm">
            En el periodo seleccionado hubo {abnormalStools} registros de heces no normales.
          </p>
        </Card>
      ) : null}
    </section>
  );
}
