"use client";

import { useMemo, useState } from "react";
import { Camera, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toLocalDatetimeValue } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo";
import { buildStoragePath, STORAGE_BUCKETS } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { symptomLogSchema } from "@/lib/validations";
import type { AppContext } from "@/types/app";

const symptomTypes = [
  { value: "lagana", label: "Lagana" },
  { value: "irritacion", label: "Irritacion" },
  { value: "tos", label: "Tos" },
  { value: "estornudos", label: "Estornudos" },
  { value: "piel", label: "Piel" },
  { value: "energia_baja", label: "Energia baja" },
  { value: "otro", label: "Otro" }
];

export function SymptomLogForm({ context }: { context: AppContext }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("lagana");
  const [severity, setSeverity] = useState<"baja" | "media" | "alta">("media");
  const [occurredAt, setOccurredAt] = useState(toLocalDatetimeValue());
  const [notes, setNotes] = useState("");

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!context.pet) {
      setError("Primero registra a Campanita en la base de datos.");
      return;
    }

    const parsed = symptomLogSchema.safeParse({
      type,
      severity,
      notes,
      occurred_at: occurredAt
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Verifica los campos.");
      return;
    }

    if (isDemoMode) {
      setError("Modo exploracion: el guardado de registros esta desactivado.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    let photoPath: string | null = null;

    if (file) {
      photoPath = buildStoragePath({
        householdId: context.household.id,
        petId: context.pet.id,
        category: type,
        fileName: file.name
      });

      const upload = await supabase.storage
        .from(STORAGE_BUCKETS.symptomPhotos)
        .upload(photoPath, file, {
          contentType: file.type,
          upsert: false
        });

      if (upload.error) {
        setSaving(false);
        setError(upload.error.message);
        return;
      }
    }

    const { data, error: insertError } = await supabase
      .from("symptom_logs")
      .insert({
        household_id: context.household.id,
        pet_id: context.pet.id,
        type,
        severity,
        notes,
        photo_url: photoPath,
        occurred_at: new Date(occurredAt).toISOString(),
        created_by: context.userId
      })
      .select("id")
      .single();

    setSaving(false);

    if (insertError) {
      if (photoPath) {
        await supabase.storage.from(STORAGE_BUCKETS.symptomPhotos).remove([photoPath]);
      }
      setError(insertError.message);
      return;
    }

    router.push(`/salud/otros/${data.id}`);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Card className="space-y-4">
        <FormField label="Foto" hint="Opcional">
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-outline-variant/70 bg-surface-container-low text-center">
            {preview ? (
              <img
                src={preview}
                alt="Vista previa de la foto"
                width={480}
                height={480}
                decoding="async"
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
            ) : (
              <>
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/25 text-primary">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="font-semibold">Subir o tomar foto</p>
                <p className="mt-1 text-sm text-on-surface-variant">JPG, PNG o HEIC</p>
              </>
            )}
            <input
              className="hidden"
              accept="image/*"
              capture="environment"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipo">
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              {symptomTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Severidad">
            <Select value={severity} onChange={(event) => setSeverity(event.target.value as "baja" | "media" | "alta")}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Fecha y hora">
          <Input type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
        </FormField>

        <FormField label="Notas">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Describe lo que viste y cualquier contexto importante"
          />
        </FormField>
      </Card>

      {error ? <p className="rounded-2xl bg-error-container px-4 py-3 text-sm text-error">{error}</p> : null}

      <Button className="w-full" disabled={saving} type="submit">
        {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Guardar registro
      </Button>
    </form>
  );
}
