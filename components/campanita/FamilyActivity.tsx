import { Camera, HeartPulse, Pill, ShieldPlus, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FamilyActivityItem } from "@/types/app";

const icons = {
  medication: Pill,
  meal: Utensils,
  stool: Camera,
  symptom: HeartPulse,
  vet: ShieldPlus
};

export function FamilyActivity({
  items,
  canManage = false,
  undoingId,
  onUndo
}: {
  items: FamilyActivityItem[];
  canManage?: boolean;
  undoingId?: string | null;
  onUndo?: (item: FamilyActivityItem) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">Actividad reciente</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = icons[item.icon];

          return (
            <Card key={`${item.icon}-${item.id}`} className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-container/20 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-on-surface-variant">{item.subtitle}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{item.relative_label}</p>
              </div>
              {canManage && item.undoType && item.undoId && onUndo ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-10 shrink-0 rounded-2xl px-3 py-2 text-xs"
                  onClick={() => onUndo(item)}
                  disabled={undoingId === `${item.undoType}-${item.undoId}`}
                >
                  Deshacer
                </Button>
              ) : null}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
