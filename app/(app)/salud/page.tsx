import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAppContext } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { getStoolLogs } from "@/lib/data";

export default async function HealthPage() {
  const context = await requireAppContext();
  const stools = await getStoolLogs(context);

  return (
    <AppShell title="Salud" subtitle="Historial digestivo y síntomas" context={context}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Registro de heces</h2>
            <p className="text-sm text-on-surface-variant">Historial reciente con foto, consistencia y notas.</p>
          </div>
          <Link href="/salud/heces/nuevo">
            <Button>Nueva</Button>
          </Link>
        </div>

        {stools.length ? (
          stools.map((item) => (
            <Link key={item.id} href={`/salud/heces/${item.id}`}>
              <Card className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-[1.25rem] bg-surface-container-low">
                  {item.photo_signed_url ? (
                    <img src={item.photo_signed_url} alt="Foto del registro" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.consistency}</p>
                  <p className="text-sm text-on-surface-variant">{formatDateTime(item.occurred_at)}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {item.notes || `Color ${item.color}`}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-on-surface-variant" />
              </Card>
            </Link>
          ))
        ) : (
          <EmptyState
            title="Todavía no hay registros"
            description="Usa el botón de arriba para guardar la primera foto de heces y empezar el historial."
          />
        )}
      </div>
    </AppShell>
  );
}
