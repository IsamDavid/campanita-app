import { VomitLogForm } from "@/components/campanita/VomitLogForm";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";

export default async function NewVomitLogPage() {
  const context = await requireAppContext();
  return (
    <AppShell title="Registrar vomito" subtitle="Foto, fecha y notas" context={context}>
      <VomitLogForm context={context} />
    </AppShell>
  );
}
