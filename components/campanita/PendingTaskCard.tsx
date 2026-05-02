"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, MessageSquarePlus, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { DayCheckItem } from "@/types/app";
import type { UserRole } from "@/types/database";

export function PendingTaskCard({
  item,
  userId,
  role
}: {
  item: DayCheckItem;
  userId: string;
  role: UserRole;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"dada" | "saltada" | "nota" | "bien" | "poco" | "nada" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const editable = role === "owner" || role === "caregiver";

  async function updateCheck(action: "dada" | "saltada" | "nota" | "bien" | "poco" | "nada") {
    if (isDemoMode) {
      setMessage("Modo exploracion: esta accion esta desactivada.");
      return;
    }

    if (!editable) {
      setMessage("Tu rol solo permite lectura.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const table =
      item.type === "meal"
        ? "meal_checks"
        : item.type === "medication"
          ? "medication_checks"
          : "care_task_checks";

    setBusy(action);
    setMessage(null);

    const { data: current } = await supabase.from(table).select("status, notes").eq("id", item.checkId).maybeSingle();

    if (!current) {
      setBusy(null);
      setMessage("No se encontró el registro.");
      return;
    }

    if (
      (current.status === "dada" || current.status === "hecha") &&
      (action === "dada" || action === "bien" || action === "poco")
    ) {
      setBusy(null);
      setMessage("Ese pendiente ya fue marcado.");
      return;
    }

    const note =
      action === "nota"
        ? window.prompt("Agrega una nota para este pendiente", current.notes ?? "") ?? current.notes
        : current.notes;

    const mealIntake = action === "bien" || action === "poco" || action === "nada" ? action : null;
    const status =
      mealIntake === "bien" || mealIntake === "poco"
        ? "dada"
        : mealIntake === "nada"
          ? "saltada"
          : item.type === "care" && action === "dada"
            ? "hecha"
            : action;

    const payload =
      action === "nota"
        ? { notes: note }
        : item.type === "meal"
          ? {
              status,
              intake: mealIntake,
              completed_at: new Date().toISOString(),
              completed_by: userId,
              notes: note
            }
        : {
            status,
            completed_at: new Date().toISOString(),
            completed_by: userId,
            notes: note
          };

    const { error } = await supabase.from(table).update(payload).eq("id", item.checkId);

    setBusy(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.refresh();
  }

  const tone =
    item.status === "dada"
      || item.status === "hecha"
      ? "success"
      : item.status === "saltada"
        ? "danger"
        : item.type === "medication"
          ? "secondary"
          : "neutral";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{item.title}</p>
          <p className="text-sm text-on-surface-variant">{item.subtitle}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDateTime(item.scheduledAt)}
          </p>
        </div>
        <StatusBadge tone={tone}>
          {item.status === "dada"
            ? "Dada"
            : item.status === "hecha"
              ? "Hecha"
            : item.status === "saltada"
              ? "Saltada"
              : "Pendiente"}
        </StatusBadge>
      </div>

      {item.completedByName ? (
        <p className="text-xs text-on-surface-variant">
          Último cambio por {item.completedByName}
          {item.completedAt ? ` · ${formatDateTime(item.completedAt)}` : ""}
        </p>
      ) : null}

      {item.notes ? (
        <div className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
          {item.notes}
        </div>
      ) : null}

      {item.type === "meal" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button type="button" className="px-3 text-xs" disabled={busy !== null} onClick={() => updateCheck("bien")}>
            <CheckCircle2 className="h-4 w-4" />
            Bien
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-3 text-xs"
            disabled={busy !== null}
            onClick={() => updateCheck("poco")}
          >
            Poco
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-3 text-xs"
            disabled={busy !== null}
            onClick={() => updateCheck("nada")}
          >
            Nada
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-3 text-xs"
            disabled={busy !== null}
            onClick={() => updateCheck("nota")}
          >
            <MessageSquarePlus className="h-4 w-4" />
            Nota
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" className="px-3 text-xs" disabled={busy !== null} onClick={() => updateCheck("dada")}>
            <CheckCircle2 className="h-4 w-4" />
            {item.type === "care" ? "Hecho" : "Ya se dio"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-3 text-xs"
            disabled={busy !== null}
            onClick={() => updateCheck("saltada")}
          >
            <SkipForward className="h-4 w-4" />
            Saltar
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-3 text-xs"
            disabled={busy !== null}
            onClick={() => updateCheck("nota")}
          >
            <MessageSquarePlus className="h-4 w-4" />
            Nota
          </Button>
        </div>
      )}

      {message ? <p className="text-xs text-on-surface-variant">{message}</p> : null}
    </Card>
  );
}
