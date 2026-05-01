"use client";

import { Printer, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SummaryActions() {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: "Resumen veterinario de Campanita",
        text: "Resumen clínico listo para compartir.",
        url
      });
      return;
    }

    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Imprimir / PDF
      </Button>
      <Button type="button" variant="secondary" onClick={share}>
        <Share2 className="h-4 w-4" />
        Compartir resumen
      </Button>
    </div>
  );
}
