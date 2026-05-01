import { Sparkles } from "lucide-react";

import { CampanitaIcon } from "@/components/campanita/CampanitaIcon";
import { Card } from "@/components/ui/card";
import type { Household, Pet, Profile } from "@/types/app";

export function PetHeader({
  pet,
  household,
  profile
}: {
  pet: Pet | null;
  household: Household;
  profile: Profile | null;
}) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(143,185,150,0.25),rgba(183,180,254,0.12),rgba(255,255,255,0.9))]">
      <div className="flex items-center gap-4">
        <CampanitaIcon className="h-16 w-16 rounded-[1.4rem]" priority />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-2xl font-extrabold">{pet?.name ?? "Campanita"}</h2>
            <span className="pill-chip bg-white/70 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Activa
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            {pet?.breed || "Perrita de la familia"} · {household.name}
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            Sesión: {profile?.full_name ?? "Miembro del hogar"}
          </p>
        </div>
      </div>
    </Card>
  );
}
