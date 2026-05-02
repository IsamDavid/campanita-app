import { SymptomLogForm } from "@/components/campanita/SymptomLogForm";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";

export default async function NewOtherSymptomPage() {
  const context = await requireAppContext();
  return (
    <AppShell title="Otro registro" subtitle="Foto, tipo, fecha y notas" context={context}>
      <SymptomLogForm context={context} />
    </AppShell>
  );
}
