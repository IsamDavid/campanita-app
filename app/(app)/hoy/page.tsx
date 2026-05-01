import { AppShell } from "@/components/layout/AppShell";
import { TodayDashboard } from "@/components/campanita/TodayDashboard";
import { requireAppContext } from "@/lib/auth";
import { getTodayDashboardData } from "@/lib/data";

export default async function TodayPage() {
  const context = await requireAppContext();
  const data = await getTodayDashboardData(context);

  return (
    <AppShell title="Hoy" subtitle="Vista rápida del día" context={context}>
      <TodayDashboard
        context={context}
        checks={data.checks}
        alerts={data.alerts}
        activity={data.activity}
        todayLabel={data.todayLabel}
      />
    </AppShell>
  );
}
