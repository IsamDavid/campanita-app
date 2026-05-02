"use client";

import { useMemo, useState } from "react";
import { Camera, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { buildStoragePath, STORAGE_BUCKETS } from "@/lib/storage";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { AppContext } from "@/types/app";

export function SymptomPhotoUpdater({
  context,
  recordId,
  recordType,
  existingPhotoPath
}: {
  context: AppContext;
  recordId: string;
  recordType: string;
  existingPhotoPath?: string | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const canManage = context.role === "owner" || context.role === "caregiver";

  async function savePhoto() {
    if (!context.pet || !file || !canManage) return;

    if (isDemoMode) {
      setMessage("Modo exploracion: actualizar fotos esta desactivado.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const photoPath = buildStoragePath({
      householdId: context.household.id,
      petId: context.pet.id,
      category: recordType,
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
      setMessage(upload.error.message);
      return;
    }

    const { error: updateError } = await supabase
      .from("symptom_logs")
      .update({ photo_url: photoPath })
      .eq("id", recordId)
      .eq("household_id", context.household.id);

    if (updateError) {
      await supabase.storage.from(STORAGE_BUCKETS.symptomPhotos).remove([photoPath]);
      setSaving(false);
      setMessage(updateError.message);
      return;
    }

    if (existingPhotoPath) {
      await supabase.storage.from(STORAGE_BUCKETS.symptomPhotos).remove([existingPhotoPath]);
    }

    setSaving(false);
    setFile(null);
    setMessage("Foto guardada.");
    router.refresh();
  }

  if (!canManage) return null;

  return (
    <Card className="space-y-4">
      <FormField label={existingPhotoPath ? "Cambiar foto" : "Agregar foto"} hint="Desde galería o cámara">
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
              <p className="font-semibold">{existingPhotoPath ? "Reemplazar foto" : "Subir o tomar foto"}</p>
              <p className="mt-1 text-sm text-on-surface-variant">JPG, PNG o HEIC</p>
            </>
          )}
          <input
            className="hidden"
            accept="image/*"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </FormField>

      <Button className="w-full" type="button" disabled={!file || saving} onClick={savePhoto}>
        {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Guardar foto
      </Button>
      {message ? <p className="text-sm text-on-surface-variant">{message}</p> : null}
    </Card>
  );
}
