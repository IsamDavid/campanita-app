"use client";

import Link from "next/link";
import { Camera, CircleAlert, Stethoscope, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { AppContext } from "@/types/app";

const quickActionItems = [
  {
    href: "/salud/heces/nuevo",
    label: "Foto de heces",
    icon: Camera,
    kind: "link" as const
  },
  {
    label: "Vómito",
    icon: CircleAlert,
    kind: "symptom" as const,
    type: "vomito"
  },
  {
    label: "Comió poco",
    icon: UtensilsCrossed,
    kind: "symptom" as const,
    type: "comio_poco"
  },
  {
    label: "Consulta vet",
    icon: Stethoscope,
    kind: "link" as const,
    href: "/veterinaria"
  }
] as const;

export function QuickActions({
  context
}: {
  context: AppContext;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function createSymptom(type: string) {
    if (!context.pet) return;
    if (isDemoMode) {
      setMessage(`Modo exploracion: "${type}" no se guarda.`);
      return;
    }
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("symptom_logs").insert({
      household_id: context.household.id,
      pet_id: context.pet.id,
      type,
      severity: "media",
      notes: "",
      occurred_at: new Date().toISOString(),
      created_by: context.userId
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Registro rápido guardado.");
    router.refresh();
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Registro rápido</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {quickActionItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <Card className="flex aspect-square flex-col items-center justify-center gap-3 bg-surface-container-low text-center transition hover:bg-surface-container">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">{item.label}</span>
            </Card>
          );

          if (item.kind === "link" && item.href) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          }

          return (
            <button key={item.label} type="button" onClick={() => createSymptom(item.type!)}>
              {content}
            </button>
          );
        })}
      </div>
      {message ? <p className="text-sm text-on-surface-variant">{message}</p> : null}
    </section>
  );
}
