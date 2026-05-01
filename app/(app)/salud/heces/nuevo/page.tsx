import { AppShell } from "@/components/layout/AppShell";
import { StoolLogForm } from "@/components/campanita/StoolLogForm";
import { requireAppContext } from "@/lib/auth";

export default async function NewStoolLogPage() {
  const context = await requireAppContext();

  return (
    <AppShell title="Nuevo registro" subtitle="Foto, consistencia y observaciones" context={context}>
      <StoolLogForm context={context} />
    </AppShell>
  );
}
