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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/hoy");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CampanitaIcon className="mx-auto mb-4 h-20 w-20 rounded-[1.75rem]" priority />
        <h1 className="text-3xl font-extrabold">Campanita</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Control diario de salud, comidas y medicinas desde el celular.
        </p>
      </div>

      <Card>
        <form className="space-y-4" onSubmit={onSubmit}>
          {isDemoMode ? (
            <p className="rounded-2xl bg-secondary-container/20 px-4 py-3 text-sm text-on-surface-variant">
              Modo exploracion: este acceso entra directo al demo visual.
            </p>
          ) : null}
          <FormField label="Email">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </FormField>
          <FormField label="Contraseña">
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </FormField>
          {error ? <p className="text-sm text-tertiary">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-on-surface-variant">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="font-semibold text-primary">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
