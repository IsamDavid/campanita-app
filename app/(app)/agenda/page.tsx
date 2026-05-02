import { AgendaManager } from "@/components/campanita/AgendaManager";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";
import { getAgendaPageData } from "@/lib/data";

export default async function AgendaPage({
  searchParams
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const context = await requireAppContext();
  const data = await getAgendaPageData(context);
  const params = await searchParams;

  return (
    <AppShell title="Agenda" subtitle="Rutinas, paseos y citas" context={context}>
      <AgendaManager
        context={context}
        tasks={data.tasks}
        checks={data.checks}
        initialType={params?.type}
      />
    </AppShell>
  );
}
