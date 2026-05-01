import { VetManager } from "@/components/campanita/VetManager";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";
import { getVetPageData } from "@/lib/data";

export default async function VeterinaryPage() {
  const context = await requireAppContext();
  const data = await getVetPageData(context);

  return (
    <AppShell title="Veterinaria" subtitle="Consultas, vacunas y documentos" context={context}>
      <VetManager context={context} visits={data.visits} vaccines={data.vaccines} />
    </AppShell>
  );
}
