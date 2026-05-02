import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { getVomitLogById } from "@/lib/data";

export default async function VomitLogDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await requireAppContext();
  const { id } = await params;
  const record = await getVomitLogById(context, id);

  if (!record) notFound();

  return (
    <AppShell title="Detalle de vomito" subtitle={formatDateTime(record.occurred_at)} context={context}>
      <div className="space-y-4">
        {record.photo_signed_url ? (
          <Card className="overflow-hidden p-0">
            <img
              src={record.photo_signed_url}
              alt="Registro de vomito"
              width={720}
              height={720}
              decoding="async"
              fetchPriority="high"
              className="aspect-square w-full object-cover"
            />
          </Card>
        ) : null}

        <Card className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Fecha y hora</p>
            <p className="mt-1 font-semibold">{formatDateTime(record.occurred_at)}</p>
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
