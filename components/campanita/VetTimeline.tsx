import { FileBadge2, ShieldPlus, Syringe } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Vaccine, VetVisit } from "@/types/app";

export function VetTimeline({
  visits,
  vaccines
}: {
  visits: VetVisit[];
  vaccines: Vaccine[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Línea de tiempo clínica</h2>
      <div className="space-y-3">
        {visits.map((visit) => (
          <Card key={visit.id} className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{visit.reason || "Consulta veterinaria"}</p>
                <span className="text-xs text-on-surface-variant">{visit.visit_date}</span>
              </div>
              <p className="text-sm text-on-surface-variant">{visit.vet_name || "Sin veterinaria"}</p>
              {visit.diagnosis ? <p className="mt-2 text-sm">{visit.diagnosis}</p> : null}
              {visit.treatment ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-on-surface-variant">
                  <FileBadge2 className="h-4 w-4" />
                  {visit.treatment}
                </p>
              ) : null}
            </div>
          </Card>
        ))}
        {vaccines.map((vaccine) => (
          <Card key={vaccine.id} className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-container/20 text-secondary">
              <Syringe className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{vaccine.name}</p>
                <span className="text-xs text-on-surface-variant">{vaccine.applied_at || "Sin fecha"}</span>
              </div>
              <p className="text-sm text-on-surface-variant">
                Próxima dosis: {vaccine.next_due_date || "Pendiente de definir"}
              </p>
              {vaccine.notes ? <p className="mt-2 text-sm">{vaccine.notes}</p> : null}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
