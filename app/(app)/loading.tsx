import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-container ${className}`} />;
}

export default function AppLoading() {
  return (
    <div className="min-h-screen pb-28">
      <Header title="Campanita" subtitle="Cargando..." />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-margin-page py-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-16 w-16 rounded-[1.75rem]" />
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          </div>
          <SkeletonBlock className="h-4 w-full" />
        </Card>

        <Card className="space-y-4">
          <SkeletonBlock className="h-5 w-1/3" />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-24" />
          </div>
        </Card>

        <Card className="space-y-3">
          <SkeletonBlock className="h-5 w-1/2" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
