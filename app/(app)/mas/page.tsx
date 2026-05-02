import Link from "next/link";
import {
  Bell,
  Boxes,
  CalendarDays,
  ChevronRight,
  FileText,
  Pill,
  Settings2,
  Stethoscope,
  Users
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { requireAppContext } from "@/lib/auth";

const sections = [
  {
    href: "/familia",
    title: "Familia",
    description: "Miembros del hogar, código de invitación y actividad.",
    icon: Users
  },
  {
    href: "/insumos",
    title: "Insumos",
    description: "Inventario, compras y alertas de reposición.",
    icon: Boxes
  },
  {
    href: "/medicinas",
    title: "Medicinas",
    description: "Tratamientos, dosis, horarios y recetas.",
    icon: Pill
  },
  {
    href: "/agenda",
    title: "Agenda",
    description: "Paseos, limpiezas, citas y otros cuidados.",
    icon: CalendarDays
  },
  {
    href: "/veterinaria",
    title: "Veterinaria",
    description: "Consultas, vacunas y documentos clínicos.",
    icon: Stethoscope
  },
  {
    href: "/resumen",
    title: "Resumen vet",
    description: "Periodo compartible para consulta o PDF.",
    icon: FileText
  },
  {
    href: "/configuracion",
    title: "Configuración",
    description: "Sesión, PWA y notificaciones.",
    icon: Settings2
  }
] as const;

export default async function MorePage() {
  const context = await requireAppContext();

  return (
    <AppShell title="Más" subtitle="Todas las secciones de Campanita" context={context}>
      <div className="space-y-4">
        <Card className="border border-secondary/20 bg-secondary-container/15">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-secondary shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Notificaciones</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Gestiona permisos y recordatorios desde Configuración.
              </p>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link key={section.href} href={section.href} className="block">
                <Card className="flex items-center gap-4 transition hover:bg-surface-container-low">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-primary-container/20 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold">{section.title}</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">{section.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
