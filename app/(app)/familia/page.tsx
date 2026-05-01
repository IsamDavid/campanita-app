import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { FamilyActivity } from "@/components/campanita/FamilyActivity";
import { requireAppContext } from "@/lib/auth";
import { getFamilyPageData } from "@/lib/data";

export default async function FamilyPage() {
  const context = await requireAppContext();
  const data = await getFamilyPageData(context);

  return (
    <AppShell title="Familia" subtitle="Miembros del hogar y actividad" context={context}>
      <div className="space-y-5">
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Miembros</h2>
          <div className="space-y-3">
            {data.members.map((member) => (
              <Card key={member.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{member.profiles?.full_name || "Miembro sin nombre"}</p>
                  <p className="text-sm text-on-surface-variant">{member.role}</p>
                </div>
                <span className="pill-chip bg-secondary-container/25 text-on-secondary-container">
                  {member.role}
                </span>
              </Card>
            ))}
          </div>
        </section>

        <Card className="bg-secondary-container/15">
          <h3 className="text-base font-bold">Compartir hogar</h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Código del hogar para que otra persona se registre dentro de la misma familia:
          </p>
          <p className="mt-3 inline-flex rounded-pill bg-white px-4 py-2 font-mono text-lg font-bold tracking-[0.24em] text-secondary shadow-soft">
            {context.household.invite_code}
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            La persona debe usar ese código en `/signup`. Entrará al mismo household y verá los mismos datos de Campanita.
          </p>
        </Card>

        <FamilyActivity items={data.recentActivity} />
      </div>
    </AppShell>
  );
}
