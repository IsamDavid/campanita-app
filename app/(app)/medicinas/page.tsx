import { MedicationPlanner } from "@/components/campanita/MedicationPlanner";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";
import { getMedicationsPageData } from "@/lib/data";

export default async function MedicationsPage() {
  const context = await requireAppContext();
  const data = await getMedicationsPageData(context);

  return (
    <AppShell title="Medicinas" subtitle="Tratamientos activos y dosis del día" context={context}>
      <MedicationPlanner context={context} medications={data.medications} checks={data.checks} />
    </AppShell>
  );
}
