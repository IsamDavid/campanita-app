"use client";

import { useState } from "react";
import { AlertTriangle, LoaderCircle, Minus, PackagePlus, Plus, ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Supply } from "@/types/app";

function parseQuantity(quantity: string | null) {
  const parsed = Number.parseInt(quantity ?? "0", 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function nextStatus(quantity: number): Supply["status"] {
  if (quantity <= 0) return "urgente";
  if (quantity === 1) return "pronto_se_acaba";
  return "suficiente";
}

export function SupplyCard({
  supply,
  disabled = false
}: {
  supply: Supply & { photo_signed_url?: string | null };
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"minus" | "plus" | "restock" | null>(null);
  const quantity = parseQuantity(supply.quantity);
  const tone =
    supply.status === "urgente"
      ? "danger"
      : supply.status === "pronto_se_acaba"
        ? "warning"
        : "success";

  async function updateQuantity(nextQuantity: number, action: typeof busyAction) {
    setBusyAction(action);

    const now = new Date().toISOString().slice(0, 10);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("supplies")
      .update({
        quantity: String(nextQuantity),
        status: nextStatus(nextQuantity),
        purchase_date: action === "restock" ? now : supply.purchase_date
      })
      .eq("id", supply.id);

    setBusyAction(null);

    if (!error) {
      router.refresh();
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {supply.photo_signed_url ? (
            <img
              src={supply.photo_signed_url}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="h-14 w-14 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
              <ShoppingBasket className="h-5 w-5" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{supply.name}</h3>
            <p className="text-sm text-on-surface-variant">
              {supply.category || "Insumo"}{supply.store ? ` · ${supply.store}` : ""}
            </p>
          </div>
        </div>
        <StatusBadge tone={tone}>{supply.status.replaceAll("_", " ")}</StatusBadge>
      </div>
      <div className="flex items-center justify-between rounded-[1.5rem] bg-surface-container-low px-3 py-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm disabled:opacity-50"
          disabled={disabled || busyAction !== null}
          onClick={() => updateQuantity(Math.max(0, quantity - 1), "minus")}
          aria-label="Restar unidad"
        >
          {busyAction === "minus" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
        </button>
        <div className="text-center">
          <p className="text-2xl font-extrabold">{quantity}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">unidades</p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm disabled:opacity-50"
          disabled={disabled || busyAction !== null}
          onClick={() => updateQuantity(quantity + 1, "plus")}
          aria-label="Sumar unidad"
        >
          {busyAction === "plus" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>
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
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={disabled || busyAction !== null}
        onClick={() => updateQuantity(quantity + 1, "restock")}
      >
        {busyAction === "restock" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
        Reabastecer +1
      </Button>
      {supply.notes ? (
        <div className="flex items-start gap-2 rounded-2xl bg-tertiary-fixed/40 px-4 py-3 text-sm text-on-tertiary-container">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <p>{supply.notes}</p>
        </div>
      ) : null}
    </Card>
  );
}
