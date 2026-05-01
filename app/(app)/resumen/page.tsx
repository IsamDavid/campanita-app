import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryActions } from "@/components/campanita/SummaryActions";
import { VetSummary } from "@/components/campanita/VetSummary";
import { requireAppContext } from "@/lib/auth";
import { getSummaryData } from "@/lib/data";

function normalizeDate(search: string | string[] | undefined, fallback: string) {
  if (Array.isArray(search)) return search[0] ?? fallback;
  return search ?? fallback;
}

export default async function SummaryPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireAppContext();
  const params = await searchParams;
  const from = normalizeDate(params.from, new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10));
  const to = normalizeDate(params.to, new Date().toISOString().slice(0, 10));
  const days = Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000));
  const summary = await getSummaryData(context, days);

  const abnormalStools = summary.stools.filter((item) => item.consistency !== "normal").length;

  return (
    <AppShell title="Resumen vet" subtitle="Periodo compartible para consulta" context={context}>
      <div className="space-y-5 print:space-y-3">
        <Card>
          <form className="grid grid-cols-2 gap-3" action="/resumen">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Desde</span>
              <input className="input-surface" type="date" name="from" defaultValue={from} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Hasta</span>
              <input className="input-surface" type="date" name="to" defaultValue={to} />
            </label>
            <div className="col-span-2">
              <button className="w-full rounded-pill bg-primary px-4 py-3 text-sm font-semibold text-on-primary">
                Actualizar resumen
              </button>
            </div>
          </form>
        </Card>

        <SummaryActions />

        <VetSummary
          stoolCount={summary.stools.length}
          abnormalStools={abnormalStools}
          activeMedications={summary.medications.filter((item) => item.active).length}
          visitCount={summary.vetVisits.length}
          vaccineCount={summary.vaccines.length}
        />

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Síntomas y apetito</h2>
          {summary.symptoms.length ? (
            <div className="space-y-2 text-sm text-on-surface-variant">
              {summary.symptoms.map((item) => (
                <div key={item.id} className="rounded-2xl bg-surface-container-low px-4 py-3">
                  <p className="font-semibold text-on-surface">{item.type}</p>
                  <p>{item.notes || item.severity || "Sin detalle"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">No hubo síntomas registrados en el periodo.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Fotos recientes de heces</h2>
          {summary.stools.length ? (
            <div className="grid grid-cols-3 gap-3">
              {summary.stools.slice(0, 6).map((item) => {
                const imageSrc = item.thumbnail_signed_url ?? item.photo_signed_url ?? undefined;

                return (
                  <div key={item.id} className="overflow-hidden rounded-[1.2rem] bg-surface-container-low">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Registro clínico"
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-square" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Sin fotos en el periodo seleccionado.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Medicinas y comidas</h2>
          <p className="text-sm text-on-surface-variant">
            Medicinas activas: {summary.medications.filter((item) => item.active).length} · Checks de medicinas: {summary.medicationChecks.length}
          </p>
          <p className="text-sm text-on-surface-variant">
            Comidas registradas: {summary.meals.length} · Checks de comidas: {summary.mealChecks.length}
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
