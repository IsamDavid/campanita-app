import { redirect } from "next/navigation";
import { cache } from "react";

import { demoContext, isDemoMode } from "@/lib/demo";
import { getSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabaseServer";
import type { AppContext, HouseholdMemberWithProfile } from "@/types/app";
import type { UserRole } from "@/types/database";

export const protectedPrefixes = [
  "/hoy",
  "/salud",
  "/comidas",
  "/medicinas",
  "/insumos",
  "/veterinaria",
  "/resumen",
  "/familia",
  "/mas",
  "/configuracion"
];

export const getCurrentUser = cache(async function getCurrentUser() {
  if (isDemoMode) {
    return { id: demoContext.userId } as any;
  }
  if (!hasSupabaseEnv) return null;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export const getAppContext = cache(async function getAppContext(): Promise<AppContext | null> {
  if (isDemoMode) return demoContext;
  if (!hasSupabaseEnv) return null;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("household_members")
    .select("*, households(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership?.households) {
    return null;
  }

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    userId: user.id,
    role: membership.role as UserRole,
    household: membership.households,
    pet: pet ?? null,
    profile: profile ?? null
  };
});

export async function requireAppContext() {
  const context = await getAppContext();
  if (!context) {
    redirect("/login");
  }
  return context;
}

export function canEdit(role: UserRole) {
  return role === "owner" || role === "caregiver";
}

export function canInvite(role: UserRole) {
  return role === "owner";
}

export function roleLabel(role: UserRole) {
  if (role === "owner") return "Owner";
  if (role === "caregiver") return "Cuidador";
  return "Solo lectura";
}

export type MemberRecord = HouseholdMemberWithProfile;
