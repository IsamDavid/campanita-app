import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { getStoolLogById } from "@/lib/data";

export default async function StoolLogDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await requireAppContext();
  const { id } = await params;
  const record = await getStoolLogById(context, id);

  if (!record) notFound();

  return (
    <AppShell title="Detalle de heces" subtitle={formatDateTime(record.occurred_at)} context={context}>
      <div className="space-y-4">
        {record.photo_signed_url ? (
          <Card className="overflow-hidden p-0">
            <img
              src={record.photo_signed_url}
              alt="Registro de heces"
              width={720}
              height={720}
              decoding="async"
              fetchPriority="high"
              className="aspect-square w-full object-cover"
            />
          </Card>
        ) : null}

        <Card className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Consistencia</p>
              <p className="mt-1 font-semibold">{record.consistency}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Color</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-5 w-5 rounded-full border border-white" style={{ backgroundColor: record.color || "#8B4513" }} />
                <span className="font-semibold">{record.color}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-2xl bg-surface-container-low px-3 py-3">{record.has_blood ? "Con sangre" : "Sin sangre"}</div>
            <div className="rounded-2xl bg-surface-container-low px-3 py-3">{record.has_mucus ? "Con moco" : "Sin moco"}</div>
            <div className="rounded-2xl bg-surface-container-low px-3 py-3">{record.strong_smell ? "Olor fuerte" : "Sin olor fuerte"}</div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Notas</p>
            <p className="mt-1 text-sm text-on-surface-variant">{record.notes || "Sin observaciones."}</p>
          </div>
          <p className="text-xs text-on-surface-variant">Registrado por {record.created_by_name}</p>
        </Card>
      </div>
    </AppShell>
  );
}
