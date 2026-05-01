import {
  addDays,
  endOfDay,
  format,
  isAfter,
  startOfDay,
  subDays
} from "date-fns";

import { formatClock, formatLongDate, relativeFromNow } from "@/lib/dates";
import {
  demoMembers,
  demoStoolLogs,
  demoSupplies,
  getDemoFamilyPageData,
  getDemoMealsPageData,
  getDemoMedicationsPageData,
  getDemoSummaryData,
  getDemoTodayDashboardData,
  getDemoVetPageData,
  isDemoMode
} from "@/lib/demo";
import { syncReminderForSchedule } from "@/lib/reminders";
import { isRemoteAsset, STORAGE_BUCKETS } from "@/lib/storage";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
  hasSupabaseEnv
} from "@/lib/supabaseServer";
import type {
  AppContext,
  FamilyActivityItem,
  HouseholdMemberWithProfile,
  Meal,
  MealCheck,
  Medication,
  MedicationCheck,
  Pet,
  StoolLog,
  Supply,
  Vaccine,
  VetVisit
} from "@/types/app";

async function getSignedAssetUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (isRemoteAsset(path)) return path;

  const supabase = getSupabaseServiceClient();
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 6);
  return data?.signedUrl ?? null;
}

async function ensureMealChecks(context: AppContext) {
  if (!hasSupabaseEnv) return;
  if (!context.pet) return;

  const supabase = getSupabaseServiceClient();
  const today = new Date();
  const weekday = today.getDay();
  const dateStamp = format(today, "yyyy-MM-dd");

  const { data: schedules } = await supabase
    .from("meal_schedules")
    .select("*")
    .eq("household_id", context.household.id)
    .eq("pet_id", context.pet.id)
    .eq("active", true)
    .contains("days_of_week", [weekday]);

  for (const schedule of schedules ?? []) {
    const scheduledAt = new Date(`${dateStamp}T${schedule.time_of_day}`);
    const { data: existing } = await supabase
      .from("meal_checks")
      .select("id")
      .eq("schedule_id", schedule.id)
      .eq("scheduled_at", scheduledAt.toISOString())
      .maybeSingle();

    if (!existing) {
      const { data: meal } = await supabase
        .from("meals")
        .select("id, name")
        .eq("id", schedule.meal_id)
        .maybeSingle();

      await supabase.from("meal_checks").insert({
        household_id: context.household.id,
        pet_id: context.pet.id,
        meal_id: schedule.meal_id,
        schedule_id: schedule.id,
        scheduled_at: scheduledAt.toISOString(),
        status: "pendiente"
      });

      await syncReminderForSchedule({
        householdId: context.household.id,
        petId: context.pet.id,
        type: "meal",
        relatedId: schedule.id,
        title: `Comida de ${context.pet.name}`,
        body: meal ? `${meal.name} programada para ${formatClock(scheduledAt)}` : "Tienes una comida pendiente.",
        scheduledAt: scheduledAt.toISOString(),
        reminderMinutesBefore: schedule.reminder_minutes_before,
        createdBy: context.userId
      });
    }
  }
}

async function ensureMedicationChecks(context: AppContext) {
  if (!hasSupabaseEnv) return;
  if (!context.pet) return;

  const supabase = getSupabaseServiceClient();
  const today = new Date();
  const weekday = today.getDay();
  const dateStamp = format(today, "yyyy-MM-dd");

  const { data: schedules } = await supabase
    .from("medication_schedules")
    .select("*")
    .eq("household_id", context.household.id)
    .eq("pet_id", context.pet.id)
    .eq("active", true)
    .contains("days_of_week", [weekday]);

  for (const schedule of schedules ?? []) {
    const scheduledAt = new Date(`${dateStamp}T${schedule.time_of_day}`);
    const { data: existing } = await supabase
      .from("medication_checks")
      .select("id")
      .eq("schedule_id", schedule.id)
      .eq("scheduled_at", scheduledAt.toISOString())
      .maybeSingle();

    if (!existing) {
      const { data: medication } = await supabase
        .from("medications")
        .select("id, name")
        .eq("id", schedule.medication_id)
        .maybeSingle();

      await supabase.from("medication_checks").insert({
        household_id: context.household.id,
        pet_id: context.pet.id,
        medication_id: schedule.medication_id,
        schedule_id: schedule.id,
        scheduled_at: scheduledAt.toISOString(),
        status: "pendiente"
      });

      await syncReminderForSchedule({
        householdId: context.household.id,
        petId: context.pet.id,
        type: "medication",
        relatedId: schedule.id,
        title: `Medicina de ${context.pet.name}`,
        body: medication
          ? `${medication.name} programada para ${formatClock(scheduledAt)}`
          : "Tienes una medicina pendiente.",
        scheduledAt: scheduledAt.toISOString(),
        reminderMinutesBefore: schedule.reminder_minutes_before,
        createdBy: context.userId
      });
    }
  }
}

export async function ensureTodayChecks(context: AppContext) {
  await Promise.all([ensureMealChecks(context), ensureMedicationChecks(context)]);
}

async function getProfileMap(userIds: string[]) {
  if (!userIds.length) return new Map<string, string>();

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", [...new Set(userIds)]);

  return new Map((data ?? []).map((item) => [item.id, item.full_name ?? "Alguien de la familia"]));
}

export async function getPetPhotoUrl(pet: Pet | null) {
  if (!pet?.photo_url) return null;
  return getSignedAssetUrl(STORAGE_BUCKETS.petMedia, pet.photo_url);
}

export async function getHouseholdMembers(householdId: string) {
  if (isDemoMode) return demoMembers;
  if (!hasSupabaseEnv) return [];
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("household_members")
    .select("*, profiles(*)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  return (data ?? []) as HouseholdMemberWithProfile[];
}

export async function getStoolLogs(context: AppContext) {
  if (isDemoMode) return demoStoolLogs;
  if (!hasSupabaseEnv) return [];
  if (!context.pet) return [];

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("stool_logs")
    .select("*")
    .eq("household_id", context.household.id)
    .eq("pet_id", context.pet.id)
    .order("occurred_at", { ascending: false })
    .limit(30);

  const profileMap = await getProfileMap((data ?? []).map((item) => item.created_by).filter(Boolean) as string[]);

  return Promise.all(
    ((data ?? []) as StoolLog[]).map(async (item) => ({
      ...item,
      photo_signed_url: await getSignedAssetUrl(STORAGE_BUCKETS.stoolPhotos, item.photo_url),
      thumbnail_signed_url: await getSignedAssetUrl(
        STORAGE_BUCKETS.stoolPhotos,
        item.thumbnail_url ?? item.photo_url
      ),
      created_by_name: item.created_by ? profileMap.get(item.created_by) ?? "Familia" : "Familia"
    }))
  );
}

export async function getStoolLogById(context: AppContext, id: string) {
  if (isDemoMode) {
    return demoStoolLogs.find((item) => item.id === id) ?? null;
  }
  if (!hasSupabaseEnv) return null;
  if (!context.pet) return null;
  const supabase = await getSupabaseServerClient();

  const { data } = await supabase
    .from("stool_logs")
    .select("*")
    .eq("id", id)
    .eq("household_id", context.household.id)
    .eq("pet_id", context.pet.id)
    .maybeSingle();

  if (!data) return null;

  const profileMap = await getProfileMap(data.created_by ? [data.created_by] : []);

  return {
    ...data,
    photo_signed_url: await getSignedAssetUrl(STORAGE_BUCKETS.stoolPhotos, data.photo_url),
    created_by_name: data.created_by ? profileMap.get(data.created_by) ?? "Familia" : "Familia"
  };
}

export async function getTodayDashboardData(context: AppContext) {
  if (isDemoMode) {
    return getDemoTodayDashboardData();
  }
  if (!hasSupabaseEnv) {
    return {
      checks: [],
      alerts: [],
      activity: [],
      todayLabel: formatLongDate(new Date()),
      supplies: [],
      vaccines: []
    };
  }
  if (!context.pet) {
    return {
      checks: [],
      alerts: [],
      activity: [],
      todayLabel: formatLongDate(new Date()),
      supplies: [],
      vaccines: []
    };
  }

  await ensureTodayChecks(context);

  const supabase = await getSupabaseServerClient();
  const from = startOfDay(new Date()).toISOString();
  const to = endOfDay(new Date()).toISOString();

  const [
    mealChecksRes,
    medicationChecksRes,
    mealsRes,
    medicationsRes,
    suppliesRes,
    vaccinesRes,
    recentStoolsRes,
    recentSymptomsRes,
    recentVetRes
  ] = await Promise.all([
    supabase
      .from("meal_checks")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .gte("scheduled_at", from)
      .lte("scheduled_at", to)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("medication_checks")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .gte("scheduled_at", from)
      .lte("scheduled_at", to)
      .order("scheduled_at", { ascending: true }),
    supabase.from("meals").select("*").eq("household_id", context.household.id),
    supabase.from("medications").select("*").eq("household_id", context.household.id),
    supabase
      .from("supplies")
      .select("*")
      .eq("household_id", context.household.id)
      .in("status", ["pronto_se_acaba", "urgente"])
      .order("estimated_runout_date", { ascending: true })
      .limit(5),
    supabase
      .from("vaccines")
      .select("*")
      .eq("household_id", context.household.id)
      .gte("next_due_date", format(new Date(), "yyyy-MM-dd"))
      .order("next_due_date", { ascending: true })
      .limit(5),
    supabase
      .from("stool_logs")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("symptom_logs")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("vet_visits")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const mealChecks = (mealChecksRes.data ?? []) as MealCheck[];
  const medicationChecks = (medicationChecksRes.data ?? []) as MedicationCheck[];
  const meals = new Map(((mealsRes.data ?? []) as Meal[]).map((item) => [item.id, item]));
  const medications = new Map(((medicationsRes.data ?? []) as Medication[]).map((item) => [item.id, item]));

  const profileMap = await getProfileMap(
    [...mealChecks, ...medicationChecks]
      .map((item) => item.completed_by)
      .filter(Boolean) as string[]
  );

  const checks = [
    ...mealChecks.map((item) => {
      const meal = meals.get(item.meal_id);
      return {
        id: `meal-${item.id}`,
        type: "meal" as const,
        title: meal?.name ?? "Comida",
        subtitle: [formatClock(item.scheduled_at), meal?.quantity].filter(Boolean).join(" • "),
        scheduledAt: item.scheduled_at,
        status: item.status,
        checkId: item.id,
        notes: item.notes,
        completedAt: item.completed_at ?? undefined,
        completedByName: item.completed_by ? profileMap.get(item.completed_by) ?? "Familia" : null
      };
    }),
    ...medicationChecks.map((item) => {
      const medication = medications.get(item.medication_id);
      return {
        id: `med-${item.id}`,
        type: "medication" as const,
        title: medication?.name ?? "Medicina",
        subtitle: [formatClock(item.scheduled_at), medication?.dosage].filter(Boolean).join(" • "),
        scheduledAt: item.scheduled_at,
        status: item.status,
        checkId: item.id,
        notes: item.notes,
        completedAt: item.completed_at ?? undefined,
        completedByName: item.completed_by ? profileMap.get(item.completed_by) ?? "Familia" : null
      };
    })
  ].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const alerts = [
    ...((suppliesRes.data ?? []) as Supply[]).map((item) => ({
      id: item.id,
      tone: item.status === "urgente" ? "urgent" : "soft",
      title:
        item.status === "urgente"
          ? `${item.name}: urge reponer`
          : `${item.name}: se está acabando`,
      description: item.estimated_runout_date
        ? `Estimado para ${item.estimated_runout_date}`
        : "Sin fecha estimada"
    })),
    ...((vaccinesRes.data ?? []) as Vaccine[]).map((item) => ({
      id: item.id,
      tone: "calm" as const,
      title: `Próxima vacuna: ${item.name}`,
      description: item.next_due_date ? `Fecha estimada ${item.next_due_date}` : "Sin fecha"
    })),
    ...((medicationsRes.data ?? []) as Medication[])
      .filter((item) => item.end_date)
      .filter((item) => isAfter(addDays(new Date(item.end_date!), 7), new Date()))
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        tone: "soft" as const,
        title: `${item.name} termina pronto`,
        description: item.end_date ? `Último día ${item.end_date}` : "Tratamiento activo"
      }))
  ];

  const activity: FamilyActivityItem[] = [
    ...((recentStoolsRes.data ?? []) as StoolLog[]).map((item) => ({
      id: item.id,
      title: "Se registró una foto de heces",
      subtitle: item.notes || item.consistency,
      created_at: item.created_at,
      relative_label: relativeFromNow(item.created_at),
      icon: "stool" as const
    })),
    ...(recentSymptomsRes.data ?? []).map((item) => ({
      id: item.id,
      title: `Síntoma: ${item.type}`,
      subtitle: item.notes || "Registro rápido",
      created_at: item.created_at,
      relative_label: relativeFromNow(item.created_at),
      icon: "symptom" as const
    })),
    ...((recentVetRes.data ?? []) as VetVisit[]).map((item) => ({
      id: item.id,
      title: item.reason || "Consulta veterinaria",
      subtitle: item.vet_name || "Registro clínico",
      created_at: item.created_at,
      relative_label: relativeFromNow(item.created_at),
      icon: "vet" as const
    })),
    ...mealChecks
      .filter((item) => item.completed_at)
      .map((item) => ({
        id: item.id,
        title: `Comida ${item.status}`,
        subtitle: meals.get(item.meal_id)?.name ?? "Comida",
        created_at: item.completed_at!,
        relative_label: relativeFromNow(item.completed_at!),
        icon: "meal" as const
      })),
    ...medicationChecks
      .filter((item) => item.completed_at)
      .map((item) => ({
        id: item.id,
        title: `Medicina ${item.status}`,
        subtitle: medications.get(item.medication_id)?.name ?? "Medicina",
        created_at: item.completed_at!,
        relative_label: relativeFromNow(item.completed_at!),
        icon: "medication" as const
      }))
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);

  return {
    checks,
    alerts,
    activity,
    todayLabel: formatLongDate(new Date()),
    supplies: (suppliesRes.data ?? []) as Supply[],
    vaccines: (vaccinesRes.data ?? []) as Vaccine[]
  };
}

export async function getMealsPageData(context: AppContext) {
  if (isDemoMode) return getDemoMealsPageData();
  if (!hasSupabaseEnv) return { meals: [], schedules: [], checks: [] };
  if (!context.pet) return { meals: [], schedules: [], checks: [] };
  await ensureMealChecks(context);
  const supabase = await getSupabaseServerClient();
  const from = startOfDay(new Date()).toISOString();
  const to = endOfDay(new Date()).toISOString();
  const [mealsRes, schedulesRes, checksRes] = await Promise.all([
    supabase
      .from("meals")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("meal_schedules")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("time_of_day", { ascending: true }),
    supabase
      .from("meal_checks")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .gte("scheduled_at", from)
      .lte("scheduled_at", to)
      .order("scheduled_at", { ascending: true })
  ]);

  const profileMap = await getProfileMap(
    ((checksRes.data ?? []) as MealCheck[]).map((item) => item.completed_by).filter(Boolean) as string[]
  );

  return {
    meals: (mealsRes.data ?? []) as Meal[],
    schedules: schedulesRes.data ?? [],
    checks: ((checksRes.data ?? []) as MealCheck[]).map((item) => ({
      ...item,
      completed_by_name: item.completed_by ? profileMap.get(item.completed_by) ?? "Familia" : null
    }))
  };
}

export async function getMedicationsPageData(context: AppContext) {
  if (isDemoMode) return getDemoMedicationsPageData();
  if (!hasSupabaseEnv) return { medications: [], schedules: [], checks: [] };
  if (!context.pet) return { medications: [], schedules: [], checks: [] };
  await ensureMedicationChecks(context);
  const supabase = await getSupabaseServerClient();
  const from = startOfDay(new Date()).toISOString();
  const to = endOfDay(new Date()).toISOString();
  const [medicationsRes, schedulesRes, checksRes] = await Promise.all([
    supabase
      .from("medications")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("medication_schedules")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("time_of_day", { ascending: true }),
    supabase
      .from("medication_checks")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .gte("scheduled_at", from)
      .lte("scheduled_at", to)
      .order("scheduled_at", { ascending: true })
  ]);

  const profileMap = await getProfileMap(
    ((checksRes.data ?? []) as MedicationCheck[])
      .map((item) => item.completed_by)
      .filter(Boolean) as string[]
  );

  return {
    medications: (medicationsRes.data ?? []) as Medication[],
    schedules: schedulesRes.data ?? [],
    checks: ((checksRes.data ?? []) as MedicationCheck[]).map((item) => ({
      ...item,
      completed_by_name: item.completed_by ? profileMap.get(item.completed_by) ?? "Familia" : null
    }))
  };
}

export async function getSuppliesData(context: AppContext) {
  if (isDemoMode) return demoSupplies;
  if (!hasSupabaseEnv) return [];
  if (!context.pet) return [];
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("supplies")
    .select("*")
    .eq("household_id", context.household.id)
    .eq("pet_id", context.pet.id)
    .order("estimated_runout_date", { ascending: true });
  return (data ?? []) as Supply[];
}

export async function getVetPageData(context: AppContext) {
  if (isDemoMode) return getDemoVetPageData();
  if (!hasSupabaseEnv) return { visits: [], vaccines: [], documents: [] };
  if (!context.pet) return { visits: [], vaccines: [], documents: [] };
  const supabase = await getSupabaseServerClient();
  const [visitsRes, vaccinesRes, documentsRes] = await Promise.all([
    supabase
      .from("vet_visits")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("visit_date", { ascending: false }),
    supabase
      .from("vaccines")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("applied_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("household_id", context.household.id)
      .eq("pet_id", context.pet.id)
      .order("created_at", { ascending: false })
  ]);

  const documents = await Promise.all(
    (documentsRes.data ?? []).map(async (item) => ({
      ...item,
      signed_url: await getSignedAssetUrl(STORAGE_BUCKETS.documents, item.file_url)
    }))
  );

  return {
    visits: (visitsRes.data ?? []) as VetVisit[],
    vaccines: (vaccinesRes.data ?? []) as Vaccine[],
    documents
  };
}

export async function getFamilyPageData(context: AppContext) {
  if (isDemoMode) return getDemoFamilyPageData();
  const [members, dashboardData] = await Promise.all([
    getHouseholdMembers(context.household.id),
    getTodayDashboardData(context)
  ]);

  return {
    members,
    recentActivity: dashboardData.activity
  };
}

export async function getSummaryData(context: AppContext, fromDaysAgo = 14) {
  if (isDemoMode) {
    return getDemoSummaryData();
  }
  if (!hasSupabaseEnv) {
    return {
      symptoms: [] as any[],
      stools: [] as Array<StoolLog & { photo_signed_url?: string | null; thumbnail_signed_url?: string | null }>,
      meals: [] as Meal[],
      mealChecks: [] as any[],
      medications: [] as Medication[],
      medicationChecks: [] as any[],
      vetVisits: [] as VetVisit[],
      vaccines: [] as Vaccine[]
    };
  }
  if (!context.pet) {
    return {
      symptoms: [] as any[],
      stools: [] as Array<StoolLog & { photo_signed_url?: string | null; thumbnail_signed_url?: string | null }>,
      meals: [] as Meal[],
      mealChecks: [] as any[],
      medications: [] as Medication[],
      medicationChecks: [] as any[],
      vetVisits: [] as VetVisit[],
      vaccines: [] as Vaccine[]
    };
  }

  const supabase = await getSupabaseServerClient();
  const from = subDays(new Date(), fromDaysAgo).toISOString();

  const [symptomsRes, stoolsRes, mealsRes, mealChecksRes, medsRes, medChecksRes, visitsRes, vaccinesRes] =
    await Promise.all([
      supabase
        .from("symptom_logs")
        .select("*")
        .eq("household_id", context.household.id)
        .eq("pet_id", context.pet.id)
        .gte("occurred_at", from)
        .order("occurred_at", { ascending: false }),
      supabase
        .from("stool_logs")
        .select("*")
        .eq("household_id", context.household.id)
        .eq("pet_id", context.pet.id)
        .gte("occurred_at", from)
        .order("occurred_at", { ascending: false }),
      supabase.from("meals").select("*").eq("household_id", context.household.id).eq("pet_id", context.pet.id),
      supabase
        .from("meal_checks")
        .select("*")
        .eq("household_id", context.household.id)
        .eq("pet_id", context.pet.id)
        .gte("scheduled_at", from)
        .order("scheduled_at", { ascending: false }),
      supabase
        .from("medications")
        .select("*")
        .eq("household_id", context.household.id)
        .eq("pet_id", context.pet.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("medication_checks")
        .select("*")
        .eq("household_id", context.household.id)
        .eq("pet_id", context.pet.id)
        .gte("scheduled_at", from)
        .order("scheduled_at", { ascending: false }),
      supabase
        .from("vet_visits")
        .select("*")
        .eq("household_id", context.household.id)
        .eq("pet_id", context.pet.id)
        .gte("created_at", from)
        .order("visit_date", { ascending: false }),
      supabase
        .from("vaccines")
        .select("*")
        .eq("household_id", context.household.id)
        .eq("pet_id", context.pet.id)
        .order("applied_at", { ascending: false })
    ]);

  const stools = await Promise.all(
    ((stoolsRes.data ?? []) as StoolLog[]).map(async (item) => ({
      ...item,
      photo_signed_url: await getSignedAssetUrl(STORAGE_BUCKETS.stoolPhotos, item.photo_url),
      thumbnail_signed_url: await getSignedAssetUrl(
        STORAGE_BUCKETS.stoolPhotos,
        item.thumbnail_url ?? item.photo_url
      )
    }))
  );

  return {
    symptoms: symptomsRes.data ?? [],
    stools,
    meals: mealsRes.data ?? [],
    mealChecks: mealChecksRes.data ?? [],
    medications: medsRes.data ?? [],
    medicationChecks: medChecksRes.data ?? [],
    vetVisits: visitsRes.data ?? [],
    vaccines: vaccinesRes.data ?? []
  };
}

export function getUpcomingVaccines(vaccines: Vaccine[]) {
  return vaccines
    .filter((item) => item.next_due_date)
    .sort((a, b) => (a.next_due_date ?? "").localeCompare(b.next_due_date ?? ""))
    .slice(0, 3);
}
