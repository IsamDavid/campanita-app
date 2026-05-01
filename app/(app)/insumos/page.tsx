import { SupplyManager } from "@/components/campanita/SupplyManager";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";
import { getSuppliesData } from "@/lib/data";

export default async function SuppliesPage() {
  const context = await requireAppContext();
  const supplies = await getSuppliesData(context);

  return (
    <AppShell title="Insumos" subtitle="Compras, consumo y alertas de reposición" context={context}>
      <SupplyManager context={context} supplies={supplies} />
    </AppShell>
  );
}
