import { AlertTriangle, ShoppingBasket } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Supply } from "@/types/app";

export function SupplyCard({ supply }: { supply: Supply }) {
  const tone =
    supply.status === "urgente"
      ? "danger"
      : supply.status === "pronto_se_acaba"
        ? "warning"
        : "success";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
            <ShoppingBasket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{supply.name}</h3>
            <p className="text-sm text-on-surface-variant">
              {supply.category || "Insumo"}{supply.store ? ` · ${supply.store}` : ""}
            </p>
          </div>
        </div>
        <StatusBadge tone={tone}>{supply.status.replaceAll("_", " ")}</StatusBadge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-on-surface-variant">
        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em]">Compra</p>
          <p className="mt-1 font-semibold text-on-surface">{supply.purchase_date || "Sin fecha"}</p>
        </div>
        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em]">Recompra</p>
          <p className="mt-1 font-semibold text-on-surface">{supply.estimated_runout_date || "Sin cálculo"}</p>
        </div>
      </div>
      {supply.notes ? (
        <div className="flex items-start gap-2 rounded-2xl bg-tertiary-fixed/40 px-4 py-3 text-sm text-on-tertiary-container">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <p>{supply.notes}</p>
        </div>
      ) : null}
    </Card>
  );
}
