import { Bone, PawPrint } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon = "paw",
  className
}: {
  title: string;
  description: string;
  icon?: "paw" | "bone";
  className?: string;
}) {
  const Icon = icon === "bone" ? Bone : PawPrint;

  return (
    <Card className={cn("border border-dashed border-outline-variant/70 bg-surface-container-low text-center", className)}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
    </Card>
  );
}
