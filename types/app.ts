import type { Database, UserRole } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Household = Database["public"]["Tables"]["households"]["Row"];
export type Pet = Database["public"]["Tables"]["pets"]["Row"];
export type StoolLog = Database["public"]["Tables"]["stool_logs"]["Row"];
export type SymptomLog = Database["public"]["Tables"]["symptom_logs"]["Row"];
export type Meal = Database["public"]["Tables"]["meals"]["Row"];
export type MealSchedule = Database["public"]["Tables"]["meal_schedules"]["Row"];
export type MealCheck = Database["public"]["Tables"]["meal_checks"]["Row"];
export type Medication = Database["public"]["Tables"]["medications"]["Row"];
export type MedicationSchedule = Database["public"]["Tables"]["medication_schedules"]["Row"];
export type MedicationCheck = Database["public"]["Tables"]["medication_checks"]["Row"];
export type Supply = Database["public"]["Tables"]["supplies"]["Row"];
export type VetVisit = Database["public"]["Tables"]["vet_visits"]["Row"];
export type Vaccine = Database["public"]["Tables"]["vaccines"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];

export interface HouseholdMemberWithProfile {
  id: string;
  household_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profiles?: Profile | null;
}

export interface AppContext {
  userId: string;
  role: UserRole;
  household: Household;
  pet: Pet | null;
  profile: Profile | null;
}

export interface DayCheckItem {
  id: string;
  type: "meal" | "medication";
  title: string;
  subtitle: string;
  scheduledAt: string;
  status: "pendiente" | "dada" | "saltada";
  checkId: string;
  notes: string | null;
  completedByName?: string | null;
  completedAt?: string | null;
}

export interface AlertItem {
  id: string;
  tone: "calm" | "urgent" | "soft";
  title: string;
  description: string;
  recordType?: "symptom";
  recordId?: string;
  photoUrl?: string | null;
  photoPath?: string | null;
  canDelete?: boolean;
}

export interface FamilyActivityItem {
  id: string;
  title: string;
  subtitle: string;
  created_at: string;
  relative_label: string;
  icon: "medication" | "meal" | "stool" | "symptom" | "vet";
}
