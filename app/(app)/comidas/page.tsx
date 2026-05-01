import { MealPlanner } from "@/components/campanita/MealPlanner";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";
import { getMealsPageData } from "@/lib/data";

export default async function MealsPage() {
  const context = await requireAppContext();
  const data = await getMealsPageData(context);

  return (
    <AppShell title="Comidas" subtitle="Plan y checks del día" context={context}>
      <MealPlanner context={context} meals={data.meals} checks={data.checks} />
    </AppShell>
  );
}
