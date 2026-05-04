import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryActions } from "@/components/campanita/SummaryActions";
import { VetSummary } from "@/components/campanita/VetSummary";
import { requireAppContext } from "@/lib/auth";
import { getSummaryData } from "@/lib/data";
import { formatDateTime, getAppDateKey } from "@/lib/dates";

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
  const from = normalizeDate(params.from, getAppDateKey(new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)));
  const to = normalizeDate(params.to, getAppDateKey(new Date()));
  const [rangeFrom, rangeTo] = from <= to ? [from, to] : [to, from];
  const summary = await getSummaryData(context, { from: rangeFrom, to: rangeTo });

  const abnormalStools = summary.stools.filter((item) => item.consistency !== "normal").length;
  const vomits = summary.symptoms.filter((item) => item.type === "vomito");
  const highSeveritySymptoms = summary.symptoms.filter((item) => item.severity === "alta");
  const mealDone = summary.mealChecks.filter((item) => item.status === "dada").length;
  const mealSkipped = summary.mealChecks.filter((item) => item.status === "saltada").length;
  const mealLowIntake = summary.mealChecks.filter((item) => item.intake === "poco" || item.intake === "nada").length;
  const medicationDone = summary.medicationChecks.filter((item) => item.status === "dada").length;
  const medicationSkipped = summary.medicationChecks.filter((item) => item.status === "saltada").length;
  const careChecks = summary.careChecks ?? [];
  const careDone = careChecks.filter((item) => item.status === "hecha").length;
  const careSkipped = careChecks.filter((item) => item.status === "saltada").length;
  const activeMedications = summary.medications.filter((item) => item.active);

  return (
    <AppShell title="Resumen vet" subtitle="Periodo compartible para consulta" context={context}>
      <div className="space-y-5 print:space-y-3">
        <Card className="space-y-2 print:border print:border-surface-container print:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Resumen veterinario
          </p>
          <h2 className="text-2xl font-extrabold">{context.pet?.name ?? "Campanita"}</h2>
          <p className="text-sm text-on-surface-variant">
            Periodo: <span className="font-semibold text-on-surface">{summary.labels?.period ?? `${rangeFrom} - ${rangeTo}`}</span>
          </p>
          <p className="text-sm text-on-surface-variant">
            Familia: {context.household.name} · Generado: {summary.labels?.generatedAt ?? formatDateTime(new Date())}
          </p>
          {context.pet?.breed ? (
            <p className="text-sm text-on-surface-variant">Raza/especie: {context.pet.breed}</p>
          ) : null}
        </Card>

        <Card className="print:hidden">
          <form className="grid grid-cols-2 gap-3" action="/resumen">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Desde</span>
              <input className="input-surface" type="date" name="from" defaultValue={rangeFrom} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Hasta</span>
              <input className="input-surface" type="date" name="to" defaultValue={rangeTo} />
            </label>
            <div className="col-span-2">
              <button className="w-full rounded-pill bg-primary px-4 py-3 text-sm font-semibold text-on-primary">
                Actualizar resumen
              </button>
            </div>
          </form>
        </Card>

        <div className="print:hidden">
          <SummaryActions />
        </div>

        <VetSummary
          stoolCount={summary.stools.length}
          abnormalStools={abnormalStools}
          activeMedications={activeMedications.length}
          visitCount={summary.vetVisits.length}
          vaccineCount={summary.vaccines.length}
        />

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Puntos relevantes para consulta</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-on-surface-variant">
            <li>{summary.symptoms.length} síntomas registrados; {vomits.length} vómitos; {highSeveritySymptoms.length} de severidad alta.</li>
            <li>{summary.stools.length} registros de heces; {abnormalStools} no normales.</li>
            <li>Comidas: {mealDone} dadas, {mealSkipped} saltadas, {mealLowIntake} con poco/nada de apetito.</li>
            <li>Medicinas: {medicationDone} dosis dadas y {medicationSkipped} saltadas en el periodo.</li>
            <li>Cuidados: {careDone} hechos y {careSkipped} saltados.</li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Síntomas y apetito</h2>
          {summary.symptoms.length ? (
            <div className="space-y-2 text-sm text-on-surface-variant">
              {summary.symptoms.map((item) => (
                <div key={item.id} className="rounded-2xl bg-surface-container-low px-4 py-3">
                  <p className="font-semibold text-on-surface">{item.type_label ?? item.type}</p>
                  <p className="text-xs text-on-surface-variant">{item.occurred_label ?? formatDateTime(item.occurred_at)} · Severidad: {item.severity ?? "sin dato"}</p>
                  <p className="mt-1">{item.notes || "Sin detalle"}</p>
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
                        width={160}
                        height={160}
                        loading="lazy"
                        decoding="async"
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
          <h2 className="text-lg font-bold">Medicinas activas y adherencia</h2>
          {activeMedications.length ? (
            <div className="space-y-2 text-sm text-on-surface-variant">
              {activeMedications.map((item) => (
                <div key={item.id} className="rounded-2xl bg-surface-container-low px-4 py-3">
                  <p className="font-semibold text-on-surface">{item.name}</p>
                  <p>{[item.dosage, item.frequency].filter(Boolean).join(" · ") || "Sin dosis/frecuencia registrada"}</p>
                  {item.instructions ? <p className="mt-1">Indicaciones: {item.instructions}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">No hay medicinas activas registradas.</p>
          )}
          <p className="text-sm text-on-surface-variant">
            Checks de medicina en el periodo: {summary.medicationChecks.length} · Dadas: {medicationDone} · Saltadas: {medicationSkipped}
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Comidas y apetito</h2>
          <p className="text-sm text-on-surface-variant">
            Comidas registradas: {summary.meals.length} · Checks: {summary.mealChecks.length} · Dadas: {mealDone} · Saltadas: {mealSkipped}
          </p>
          <p className="text-sm text-on-surface-variant">
            Apetito bajo en checks: {mealLowIntake} registros marcados como “poco” o “nada”.
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Consultas y vacunas</h2>
          {summary.vetVisits.length ? (
            <div className="space-y-2 text-sm text-on-surface-variant">
              {summary.vetVisits.map((visit) => (
                <div key={visit.id} className="rounded-2xl bg-surface-container-low px-4 py-3">
                  <p className="font-semibold text-on-surface">{visit.visit_date} · {visit.reason || "Consulta"}</p>
                  <p>{visit.vet_name || "Sin veterinaria registrada"}</p>
                  {visit.diagnosis ? <p>Diagnóstico: {visit.diagnosis}</p> : null}
                  {visit.treatment ? <p>Tratamiento: {visit.treatment}</p> : null}
                  {visit.weight ? <p>Peso: {visit.weight} kg</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Sin consultas en el periodo.</p>
          )}
          {summary.vaccines.length ? (
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p className="font-semibold text-on-surface">Vacunas aplicadas o próximas dentro del rango:</p>
              {summary.vaccines.map((vaccine) => (
                <div key={vaccine.id} className="rounded-2xl bg-surface-container-low px-4 py-3">
                  <p className="font-semibold text-on-surface">{vaccine.name}</p>
                  <p>Aplicada: {vaccine.applied_at ?? "sin fecha"} · Próxima: {vaccine.next_due_date ?? "sin fecha"}</p>
                  {vaccine.notes ? <p>Notas: {vaccine.notes}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Sin vacunas aplicadas o próximas en el periodo.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
