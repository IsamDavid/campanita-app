"use client";

import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { VetTimeline } from "@/components/campanita/VetTimeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isDemoMode } from "@/lib/demo";
import { buildStoragePath, STORAGE_BUCKETS } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { vaccineSchema, vetVisitSchema } from "@/lib/validations";
import type { AppContext, Vaccine, VetVisit } from "@/types/app";

export function VetManager({
  context,
  visits,
  vaccines
}: {
  context: AppContext;
  visits: VetVisit[];
  vaccines: Vaccine[];
}) {
  const router = useRouter();
  const [visit, setVisit] = useState({
    visit_date: new Date().toISOString().slice(0, 10),
    vet_name: "",
    reason: "",
    diagnosis: "",
    treatment: "",
    weight: "",
    notes: "",
    documentTitle: "",
    documentFile: null as File | null
  });
  const [vaccine, setVaccine] = useState({
    name: "",
    applied_at: new Date().toISOString().slice(0, 10),
    next_due_date: "",
    notes: ""
  });
  const [savingVisit, setSavingVisit] = useState(false);
  const [savingVaccine, setSavingVaccine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitVisit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!context.pet) return;
    const parsed = vetVisitSchema.safeParse({
      ...visit,
      weight: visit.weight || undefined
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Verifica la consulta.");
      return;
    }

    if (isDemoMode) {
      setError("Modo exploracion: el guardado de consultas esta desactivado.");
      return;
    }

    setSavingVisit(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { data: visitRow, error: visitError } = await supabase
      .from("vet_visits")
      .insert({
        household_id: context.household.id,
        pet_id: context.pet.id,
        visit_date: visit.visit_date,
        vet_name: visit.vet_name,
        reason: visit.reason,
        diagnosis: visit.diagnosis,
        treatment: visit.treatment,
        weight: visit.weight ? Number(visit.weight) : null,
        notes: visit.notes,
        created_by: context.userId
      })
      .select("id")
      .single();

    if (visitError || !visitRow) {
      setSavingVisit(false);
      setError(visitError?.message ?? "No se pudo guardar la consulta.");
      return;
    }

    if (visit.documentFile && visit.documentTitle) {
      const filePath = buildStoragePath({
        householdId: context.household.id,
        petId: context.pet.id,
        category: "documents",
        fileName: visit.documentFile.name
      });

      const upload = await supabase.storage
        .from(STORAGE_BUCKETS.documents)
        .upload(filePath, visit.documentFile, { upsert: false });

      if (!upload.error) {
        await supabase.from("documents").insert({
          household_id: context.household.id,
          pet_id: context.pet.id,
          type: "vet_visit",
          title: visit.documentTitle,
          file_url: filePath,
          notes: visit.reason,
          created_by: context.userId
        });
      }
    }

    setSavingVisit(false);
    setVisit({
      visit_date: new Date().toISOString().slice(0, 10),
      vet_name: "",
      reason: "",
      diagnosis: "",
      treatment: "",
      weight: "",
      notes: "",
      documentTitle: "",
      documentFile: null
    });
    router.refresh();
  }

  async function submitVaccine(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!context.pet) return;
    const parsed = vaccineSchema.safeParse(vaccine);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Verifica la vacuna.");
      return;
    }

    if (isDemoMode) {
      setError("Modo exploracion: el guardado de vacunas esta desactivado.");
      return;
    }

    setSavingVaccine(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: insertError } = await supabase.from("vaccines").insert({
      household_id: context.household.id,
      pet_id: context.pet.id,
      name: vaccine.name,
      applied_at: vaccine.applied_at,
      next_due_date: vaccine.next_due_date || null,
      notes: vaccine.notes,
      created_by: context.userId
    });

    setSavingVaccine(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setVaccine({
      name: "",
      applied_at: new Date().toISOString().slice(0, 10),
      next_due_date: "",
      notes: ""
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <form className="space-y-4" onSubmit={submitVisit}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Nueva consulta</h2>
              <p className="text-sm text-on-surface-variant">Diagnóstico, peso y documentos.</p>
            </div>
            <Button type="submit" disabled={savingVisit}>
              {savingVisit ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Guardar
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Fecha">
              <Input type="date" value={visit.visit_date} onChange={(event) => setVisit((current) => ({ ...current, visit_date: event.target.value }))} />
            </FormField>
            <FormField label="Peso (kg)">
              <Input value={visit.weight} onChange={(event) => setVisit((current) => ({ ...current, weight: event.target.value }))} inputMode="decimal" />
            </FormField>
          </div>
          <FormField label="Veterinaria / Médico">
            <Input value={visit.vet_name} onChange={(event) => setVisit((current) => ({ ...current, vet_name: event.target.value }))} />
          </FormField>
          <FormField label="Motivo">
            <Input value={visit.reason} onChange={(event) => setVisit((current) => ({ ...current, reason: event.target.value }))} />
          </FormField>
          <FormField label="Diagnóstico">
            <Textarea value={visit.diagnosis} onChange={(event) => setVisit((current) => ({ ...current, diagnosis: event.target.value }))} />
          </FormField>
          <FormField label="Tratamiento">
            <Textarea value={visit.treatment} onChange={(event) => setVisit((current) => ({ ...current, treatment: event.target.value }))} />
          </FormField>
          <FormField label="Notas">
            <Textarea value={visit.notes} onChange={(event) => setVisit((current) => ({ ...current, notes: event.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Título del documento">
              <Input value={visit.documentTitle} onChange={(event) => setVisit((current) => ({ ...current, documentTitle: event.target.value }))} placeholder="Receta abril" />
            </FormField>
            <FormField label="Archivo">
              <Input type="file" accept="image/*,.pdf" onChange={(event) => setVisit((current) => ({ ...current, documentFile: event.target.files?.[0] ?? null }))} />
            </FormField>
          </div>
        </form>
      </Card>

      <Card>
        <form className="space-y-4" onSubmit={submitVaccine}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Registrar vacuna</h2>
              <p className="text-sm text-on-surface-variant">Mantén visible la próxima dosis.</p>
            </div>
            <Button type="submit" variant="secondary" disabled={savingVaccine}>
              {savingVaccine ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Guardar
            </Button>
          </div>
          <FormField label="Vacuna">
            <Input value={vaccine.name} onChange={(event) => setVaccine((current) => ({ ...current, name: event.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Aplicada">
              <Input type="date" value={vaccine.applied_at} onChange={(event) => setVaccine((current) => ({ ...current, applied_at: event.target.value }))} />
            </FormField>
            <FormField label="Próxima dosis">
              <Input type="date" value={vaccine.next_due_date} onChange={(event) => setVaccine((current) => ({ ...current, next_due_date: event.target.value }))} />
            </FormField>
          </div>
          <FormField label="Notas">
            <Textarea value={vaccine.notes} onChange={(event) => setVaccine((current) => ({ ...current, notes: event.target.value }))} />
          </FormField>
          {error ? <p className="text-sm text-tertiary">{error}</p> : null}
        </form>
      </Card>

      {visits.length || vaccines.length ? (
        <VetTimeline visits={visits} vaccines={vaccines} />
      ) : (
        <EmptyState
          title="Sin historial veterinario"
          description="Registra la primera consulta o vacuna para construir la línea de tiempo."
        />
      )}
    </div>
  );
}
