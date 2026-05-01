import Link from "next/link";
import { Bell, Menu } from "lucide-react";

import { CampanitaIcon } from "@/components/campanita/CampanitaIcon";

export function Header({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-background/90 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CampanitaIcon className="h-10 w-10 rounded-2xl shadow-sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
              Campanita
            </p>
            <h1 className="truncate text-xl font-extrabold">{title}</h1>
            {subtitle ? <p className="truncate text-sm text-on-surface-variant">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/configuracion"
            aria-label="Configurar notificaciones"
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <Link
            href="/mas"
            aria-label="Abrir más secciones"
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <Menu className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
