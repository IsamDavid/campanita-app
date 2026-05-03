"use client";

import { useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toLocalDatetimeValue } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { AppContext } from "@/types/app";

export function SymptomLogEditor({
  context,
  recordId,
  occurredAt,
  notes
}: {
  context: AppContext;
  recordId: string;
  occurredAt: string;
  notes?: string | null;
}) {
  const router = useRouter();
  const [dateTime, setDateTime] = useState(toLocalDatetimeValue(new Date(occurredAt)));
  const [draftNotes, setDraftNotes] = useState(notes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canManage = context.role === "owner" || context.role === "caregiver";

  async function saveChanges() {
    if (!canManage) return;

    if (isDemoMode) {
      setMessage("Modo exploracion: editar registros esta desactivado.");
      return;
    }

    if (!dateTime) {
      setMessage("Selecciona fecha y hora.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("symptom_logs")
      .update({
        occurred_at: new Date(dateTime).toISOString(),
        notes: draftNotes
      })
      .eq("id", recordId)
      .eq("household_id", context.household.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Registro actualizado.");
    router.refresh();
  }

  if (!canManage) return null;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Editar registro</h2>
        <p className="text-sm text-on-surface-variant">Ajusta fecha, hora o notas.</p>
      </div>
      <FormField label="Fecha y hora">
        <Input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} />
      </FormField>
      <FormField label="Notas">
        <Textarea value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} />
      </FormField>
      <Button className="w-full" type="button" disabled={saving} onClick={saveChanges}>
        {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Guardar cambios
      </Button>
      {message ? <p className="text-sm text-on-surface-variant">{message}</p> : null}
    </Card>
  );
}
