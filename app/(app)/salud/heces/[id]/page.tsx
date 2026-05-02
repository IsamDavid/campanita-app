import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { getStoolLogById, getStoolLogNavigation } from "@/lib/data";

export default async function StoolLogDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await requireAppContext();
  const { id } = await params;
  const [record, navigation] = await Promise.all([
    getStoolLogById(context, id),
    getStoolLogNavigation(context, id)
  ]);

  if (!record) notFound();

  const currentIndex = navigation.findIndex((item) => item.id === record.id);
  const newerRecord = currentIndex > 0 ? navigation[currentIndex - 1] : null;
  const olderRecord = currentIndex >= 0 && currentIndex < navigation.length - 1 ? navigation[currentIndex + 1] : null;

  return (
    <AppShell title="Detalle de heces" subtitle={formatDateTime(record.occurred_at)} context={context}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {newerRecord ? (
            <Link
              href={`/salud/heces/${newerRecord.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
            >
              <ChevronLeft className="h-4 w-4" />
              Más reciente
            </Link>
          ) : (
            <div />
          )}
          {olderRecord ? (
            <Link
              href={`/salud/heces/${olderRecord.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container"
            >
              Más antiguo
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>

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

        {navigation.length > 1 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-bold">Otros registros</h2>
            <div className="-mx-4 overflow-x-auto px-4 pb-2">
              <div className="flex gap-3">
                {navigation.map((item) => (
                  <Link
                    key={item.id}
                    href={`/salud/heces/${item.id}`}
                    className={`w-24 shrink-0 rounded-[1.25rem] border p-1 transition ${
                      item.active
                        ? "border-primary bg-primary-container/20"
                        : "border-transparent bg-surface-container-low"
                    }`}
                  >
                    <div className="h-20 w-full overflow-hidden rounded-[1rem] bg-surface-container">
                      {item.thumbnail_signed_url ? (
                        <img
                          src={item.thumbnail_signed_url}
                          alt="Miniatura de heces"
                          width={120}
                          height={120}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 truncate text-center text-[11px] font-semibold text-on-surface-variant">
                      {formatDateTime(item.occurred_at)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
