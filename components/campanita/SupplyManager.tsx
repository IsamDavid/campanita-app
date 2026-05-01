"use client";

import { useMemo, useState } from "react";
import { Camera, LoaderCircle, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { SupplyCard } from "@/components/campanita/SupplyCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isDemoMode } from "@/lib/demo";
import { buildStoragePath, STORAGE_BUCKETS } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { supplySchema } from "@/lib/validations";
import type { AppContext, Supply } from "@/types/app";

export function SupplyManager({
  context,
  supplies
}: {
  context: AppContext;
  supplies: Supply[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    category: "",
    purchase_date: new Date().toISOString().slice(0, 10),
    estimated_runout_date: "",
    quantity: 1,
    price: "",
    store: "",
    notes: "",
    status: "suficiente" as const
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!context.pet) return;

    const parsed = supplySchema.safeParse({
      ...form,
      price: form.price || undefined
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Verifica el insumo.");
      return;
    }

    if (isDemoMode) {
      setError("Modo exploracion: el guardado de insumos esta desactivado.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    let photoPath: string | null = null;

    if (photo) {
      photoPath = buildStoragePath({
        householdId: context.household.id,
        petId: context.pet.id,
        category: "supplies",
        fileName: photo.name
      });

      const upload = await supabase.storage
        .from(STORAGE_BUCKETS.petMedia)
        .upload(photoPath, photo, {
          contentType: photo.type,
          upsert: false
        });

      if (upload.error) {
        setSaving(false);
        setError(upload.error.message);
        return;
      }
    }

    const { error: insertError } = await supabase.from("supplies").insert({
      household_id: context.household.id,
      pet_id: context.pet.id,
      name: form.name,
      category: form.category,
      purchase_date: form.purchase_date,
      estimated_runout_date: form.estimated_runout_date || null,
      quantity: String(form.quantity),
      price: form.price ? Number(form.price) : null,
      store: form.store,
      photo_url: photoPath,
      notes: form.notes,
      status: form.status,
      created_by: context.userId
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm({
      name: "",
      category: "",
      purchase_date: new Date().toISOString().slice(0, 10),
      estimated_runout_date: "",
      quantity: 1,
      price: "",
      store: "",
      notes: "",
      status: "suficiente"
    });
    setPhoto(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Registrar insumo</h2>
              <p className="text-sm text-on-surface-variant">Croquetas, medicamentos o consumibles.</p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Guardar
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nombre">
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </FormField>
            <FormField label="Categoría">
              <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
            </FormField>
          </div>
          <FormField label="Foto del producto" hint="Opcional, se reutiliza al reabastecer">
            <label className="flex min-h-32 cursor-pointer items-center gap-4 rounded-[1.5rem] border border-dashed border-outline-variant/70 bg-surface-container-low p-3">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] bg-white">
                {preview ? (
                  <img
                    src={preview}
                    alt="Vista previa del producto"
                    width={160}
                    height={160}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary">
                    <Camera className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{photo ? photo.name : "Subir foto"}</p>
                <p className="mt-1 text-xs text-on-surface-variant">JPG, PNG o WebP. Puedes dejarlo vacío.</p>
              </div>
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              />
            </label>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Compra">
              <Input type="date" value={form.purchase_date} onChange={(event) => setForm((current) => ({ ...current, purchase_date: event.target.value }))} />
            </FormField>
            <FormField label="Se acaba aprox.">
              <Input type="date" value={form.estimated_runout_date} onChange={(event) => setForm((current) => ({ ...current, estimated_runout_date: event.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Unidades">
              <div className="flex h-12 items-center justify-between rounded-[1.25rem] bg-surface-container-low px-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm"
                  onClick={() => setForm((current) => ({ ...current, quantity: Math.max(1, current.quantity - 1) }))}
                  aria-label="Restar unidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  className="w-16 bg-transparent text-center text-lg font-bold outline-none"
                  value={form.quantity}
                  inputMode="numeric"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      quantity: Math.max(1, Number.parseInt(event.target.value || "1", 10) || 1)
                    }))
                  }
                />
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm"
                  onClick={() => setForm((current) => ({ ...current, quantity: current.quantity + 1 }))}
                  aria-label="Sumar unidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </FormField>
            <FormField label="Precio">
              <Input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} inputMode="decimal" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tienda">
              <Input value={form.store} onChange={(event) => setForm((current) => ({ ...current, store: event.target.value }))} />
            </FormField>
            <FormField label="Estado">
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as typeof form.status }))}>
                <option value="suficiente">Suficiente</option>
                <option value="pronto_se_acaba">Pronto se acaba</option>
                <option value="urgente">Urgente</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Notas">
            <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </FormField>
          {error ? <p className="text-sm text-tertiary">{error}</p> : null}
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Inventario</h2>
        {supplies.length ? (
          <div className="space-y-3">
            {supplies.map((item) => (
              <SupplyCard key={item.id} supply={item} disabled={saving} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin insumos registrados"
            description="Registra compras para que el dashboard pueda avisar cuando algo se acabe."
          />
        )}
      </section>
    </div>
  );
}
