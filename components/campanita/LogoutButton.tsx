"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export function LogoutButton() {
  const router = useRouter();

  async function signOut() {
    if (isDemoMode) {
      router.push("/hoy");
      router.refresh();
      return;
    }
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={signOut}>
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </Button>
  );
}
