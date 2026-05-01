"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { CampanitaIcon } from "@/components/campanita/CampanitaIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    householdName: "Familia Campanita",
    householdCode: "",
    petName: "Campanita",
    breed: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (isDemoMode) {
      setLoading(false);
      router.push("/hoy");
      router.refresh();
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message ?? "No se pudo crear la cuenta.");
      return;
    }

    if (!data.session) {
      setLoading(false);
      setError(
        "Para este flujo inicial, desactiva la confirmación de email en Supabase Auth o completa el onboarding después de confirmar."
      );
      return;
    }

    const { error: onboardingError } = await supabase.rpc("complete_signup", {
      p_full_name: form.fullName,
      p_household_name: form.householdName,
      p_household_code: form.householdCode,
      p_pet_name: form.petName,
      p_breed: form.breed
    });

    if (onboardingError) {
      setLoading(false);
      setError(
        onboardingError.message === "Invalid household code"
          ? "No encontré un hogar con ese código."
          : onboardingError.message ?? "No se pudo completar la configuración inicial."
      );
      return;
    }

    setLoading(false);
    router.push("/hoy");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CampanitaIcon className="mx-auto mb-4 h-20 w-20 rounded-[1.75rem]" priority />
        <h1 className="text-3xl font-extrabold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Configura el hogar y la ficha inicial de Campanita.
        </p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          {isDemoMode ? (
            <p className="rounded-2xl bg-secondary-container/20 px-4 py-3 text-sm text-on-surface-variant">
              Modo exploracion: este registro no crea cuenta real, solo abre el demo visual.
            </p>
          ) : null}
          <FormField label="Tu nombre">
            <Input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          </FormField>
          <FormField label="Código del hogar" hint="Opcional para unirte al mismo hogar">
            <Input
              value={form.householdCode}
              onChange={(event) => setForm((current) => ({ ...current, householdCode: event.target.value }))}
              placeholder="Ej. CAMPA123"
            />
          </FormField>
          <FormField label="Nombre del hogar">
            <Input
              value={form.householdName}
              disabled={Boolean(form.householdCode.trim())}
              onChange={(event) => setForm((current) => ({ ...current, householdName: event.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nombre de la perrita">
              <Input
                value={form.petName}
                disabled={Boolean(form.householdCode.trim())}
                onChange={(event) => setForm((current) => ({ ...current, petName: event.target.value }))}
              />
            </FormField>
            <FormField label="Raza">
              <Input
                value={form.breed}
                disabled={Boolean(form.householdCode.trim())}
                onChange={(event) => setForm((current) => ({ ...current, breed: event.target.value }))}
              />
            </FormField>
          </div>
          {form.householdCode.trim() ? (
            <p className="text-sm text-on-surface-variant">
              Con un código válido te unirás al hogar existente como `caregiver` y compartirás los mismos datos de Campanita.
            </p>
          ) : null}
          <FormField label="Email">
            <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </FormField>
          <FormField label="Contraseña">
            <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
          </FormField>
          {error ? <p className="text-sm text-tertiary">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Crear cuenta
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-on-surface-variant">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}
