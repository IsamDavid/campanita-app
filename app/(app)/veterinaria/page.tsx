import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { VetManager } from "@/components/campanita/VetManager";
import { AppShell } from "@/components/layout/AppShell";
import { requireAppContext } from "@/lib/auth";
import { getVetPageData } from "@/lib/data";

export default async function VeterinaryPage() {
  const context = await requireAppContext();
  const data = await getVetPageData(context);

  return (
    <AppShell title="Veterinaria" subtitle="Consultas, vacunas y documentos" context={context}>
      <div className="mb-4 flex justify-end">
        <Link
          href="/agenda?type=vet_appointment"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-secondary-container/30 px-4 py-3 text-sm font-semibold text-on-secondary-container transition hover:bg-secondary-container/50 active:scale-[0.98]"
        >
          <CalendarPlus className="h-4 w-4" />
          Programar próxima cita
        </Link>
      </div>
      <VetManager context={context} visits={data.visits} vaccines={data.vaccines} />
    </AppShell>
  );
}
