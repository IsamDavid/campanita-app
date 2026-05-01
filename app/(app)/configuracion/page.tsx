import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { NotificationSettings } from "@/components/campanita/NotificationSettings";
import { LogoutButton } from "@/components/campanita/LogoutButton";
import { requireAppContext } from "@/lib/auth";

export default async function SettingsPage() {
  const context = await requireAppContext();

  return (
    <AppShell title="Configuración" subtitle="PWA, sesión y notificaciones" context={context}>
      <div className="space-y-5">
        <NotificationSettings />

        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Sesión</h2>
          <p className="text-sm text-on-surface-variant">
            Usuario: {context.profile?.full_name || "Sin nombre"} · Rol: {context.role}
          </p>
          <LogoutButton />
        </Card>
      </div>
    </AppShell>
  );
}
