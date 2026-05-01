import type { AppContext } from "@/types/app";

import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { PetHeader } from "@/components/campanita/PetHeader";
import { Card } from "@/components/ui/card";
import { isDemoMode } from "@/lib/demo";

export function AppShell({
  title,
  subtitle,
  context,
  children
}: {
  title: string;
  subtitle?: string;
  context: AppContext;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-28">
      <Header title={title} subtitle={subtitle} />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-margin-page py-6">
        {isDemoMode ? (
          <Card className="border border-secondary/20 bg-secondary-container/18">
            <p className="text-sm font-semibold text-on-secondary-container">Modo exploracion visual</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Estas viendo datos de muestra. La navegacion funciona, pero los botones de guardado y realtime estan desactivados.
            </p>
          </Card>
        ) : null}
        <PetHeader pet={context.pet} household={context.household} profile={context.profile} />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
