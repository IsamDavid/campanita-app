"use client";

import { useMemo, useState } from "react";
import { Camera, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toLocalDatetimeValue } from "@/lib/dates";
import { isDemoMode } from "@/lib/demo";
import { buildStoragePath, createImageThumbnail, STORAGE_BUCKETS } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { stoolLogSchema } from "@/lib/validations";
import type { AppContext } from "@/types/app";

const colorOptions = [
  { label: "Marrón oscuro", value: "#5C4033" },
  { label: "Marrón", value: "#8B4513" },
  { label: "Marrón claro", value: "#CD853F" },
  { label: "Terracota", value: "#A0522D" },
  { label: "Verdoso oscuro", value: "#2F4F4F" }
];

export function StoolLogForm({ context }: { context: AppContext }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consistency, setConsistency] = useState<"liquida" | "blanda" | "normal" | "dura">("normal");
  const [color, setColor] = useState(colorOptions[1].value);
  const [hasBlood, setHasBlood] = useState(false);
  const [hasMucus, setHasMucus] = useState(false);
  const [strongSmell, setStrongSmell] = useState(false);
  const [occurredAt, setOccurredAt] = useState(toLocalDatetimeValue());
  const [notes, setNotes] = useState("");

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!context.pet) {
      setError("Primero registra a Campanita en la base de datos.");
      return;
    }

    const parsed = stoolLogSchema.safeParse({
      consistency,
      color,
      has_blood: hasBlood,
      has_mucus: hasMucus,
      strong_smell: strongSmell,
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
    let thumbnailPath: string | null = null;

    if (file) {
      photoPath = buildStoragePath({
        householdId: context.household.id,
        petId: context.pet.id,
        category: "stool",
        fileName: file.name
      });

      const upload = await supabase.storage
        .from(STORAGE_BUCKETS.stoolPhotos)
        .upload(photoPath, file, { upsert: false });

      if (upload.error) {
        setSaving(false);
        setError(upload.error.message);
        return;
      }

      try {
        const thumbnail = await createImageThumbnail(file);
        thumbnailPath = buildStoragePath({
          householdId: context.household.id,
          petId: context.pet.id,
          category: "stool/thumbnails",
          fileName: thumbnail.name
        });

        const thumbnailUpload = await supabase.storage
          .from(STORAGE_BUCKETS.stoolPhotos)
          .upload(thumbnailPath, thumbnail, {
            contentType: thumbnail.type,
            upsert: false
          });

        if (thumbnailUpload.error) {
          thumbnailPath = null;
        }
      } catch {
        thumbnailPath = null;
      }
    }

    const { data, error: insertError } = await supabase
      .from("stool_logs")
      .insert({
        household_id: context.household.id,
        pet_id: context.pet.id,
        photo_url: photoPath,
        thumbnail_url: thumbnailPath,
        consistency,
        color,
        has_blood: hasBlood,
        has_mucus: hasMucus,
        strong_smell: strongSmell,
        notes,
        occurred_at: new Date(occurredAt).toISOString(),
        created_by: context.userId
      })
      .select("id")
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/salud/heces/${data.id}`);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Card className="space-y-4">
        <FormField label="Foto" hint="Tomar o subir">
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

        <FormField label="Consistencia">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["liquida", "Líquida"],
              ["blanda", "Blanda"],
              ["normal", "Normal"],
              ["dura", "Dura"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`rounded-[1.25rem] border px-4 py-3 text-sm font-semibold ${
                  consistency === value
                    ? "border-primary bg-primary-container/25 text-primary"
                    : "border-transparent bg-surface-container-low text-on-surface-variant"
                }`}
                onClick={() => setConsistency(value as typeof consistency)}
              >
                {label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Color">
          <div className="grid grid-cols-5 gap-3">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`h-12 rounded-full border-4 ${
                  color === option.value ? "border-primary" : "border-white"
                }`}
                style={{ backgroundColor: option.value }}
                aria-label={option.label}
                onClick={() => setColor(option.value)}
              />
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Sangre", checked: hasBlood, setChecked: setHasBlood },
            { label: "Moco", checked: hasMucus, setChecked: setHasMucus },
            { label: "Olor fuerte", checked: strongSmell, setChecked: setStrongSmell }
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className={`rounded-pill px-3 py-3 text-xs font-semibold ${
                item.checked
                  ? "bg-tertiary-fixed/60 text-on-tertiary-container"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
              onClick={() => item.setChecked(!item.checked)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <FormField label="Fecha y hora">
          <Input type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} />
        </FormField>

        <FormField label="Notas">
          <Textarea
            placeholder="Añade observaciones adicionales..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </FormField>
      </Card>

      {error ? <p className="text-sm text-tertiary">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Guardar registro
      </Button>
    </form>
  );
}
