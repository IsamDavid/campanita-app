"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isDemoMode } from "@/lib/demo";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export function RealtimeRefresh({
  householdId,
  tables
}: {
  householdId: string;
  tables: string[];
}) {
  const router = useRouter();

  useEffect(() => {
    if (isDemoMode) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase.channel(`household:${householdId}:${tables.join("-")}`);

    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `household_id=eq.${householdId}`
        },
        () => router.refresh()
      );
    });

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [householdId, router, tables]);

  return null;
}
