import { addDays, subDays } from "date-fns";

import { formatLongDate, relativeFromNow } from "@/lib/dates";
import type {
  AppContext,
  DayCheckItem,
  FamilyActivityItem,
  HouseholdMemberWithProfile,
  Meal,
  MealCheck,
  Medication,
  MedicationCheck,
  Supply,
  Vaccine,
  VetVisit
} from "@/types/app";

export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const now = new Date();
const isoNow = now.toISOString();
const today = now.toISOString().slice(0, 10);

function atTime(time: string) {
  return new Date(`${today}T${time}:00`).toISOString();
}

export const demoContext: AppContext = {
  userId: "demo-user-1",
  role: "owner",
  household: {
    id: "demo-household-1",
    name: "Familia Campanita",
    invite_code: "CAMPA123",
    created_by: "demo-user-1",
    created_at: subDays(now, 120).toISOString()
  },
  pet: {
    id: "demo-pet-1",
    household_id: "demo-household-1",
    name: "Campanita",
    species: "Perro",
    breed: "Mestiza",
    birthdate: "2020-05-14",
    photo_url: "https://placehold.co/800x800/f2e6d8/406749?text=Campanita",
    created_at: subDays(now, 120).toISOString()
  },
  profile: {
    id: "demo-user-1",
    full_name: "Isa",
    avatar_url: null,
    created_at: subDays(now, 120).toISOString()
  }
};

export const demoMembers: HouseholdMemberWithProfile[] = [
  {
    id: "member-1",
    household_id: "demo-household-1",
    user_id: "demo-user-1",
    role: "owner",
    created_at: subDays(now, 120).toISOString(),
    profiles: {
      id: "demo-user-1",
      full_name: "Isa",
      avatar_url: null,
      created_at: subDays(now, 120).toISOString()
    }
  },
  {
    id: "member-2",
    household_id: "demo-household-1",
    user_id: "demo-user-2",
    role: "caregiver",
    created_at: subDays(now, 110).toISOString(),
    profiles: {
      id: "demo-user-2",
      full_name: "Mar",
      avatar_url: null,
      created_at: subDays(now, 110).toISOString()
    }
  },
  {
    id: "member-3",
    household_id: "demo-household-1",
    user_id: "demo-user-3",
    role: "viewer",
    created_at: subDays(now, 90).toISOString(),
    profiles: {
      id: "demo-user-3",
      full_name: "Papá",
      avatar_url: null,
      created_at: subDays(now, 90).toISOString()
    }
  }
];

export const demoMeals: Meal[] = [
  {
    id: "meal-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Desayuno",
    food_type: "Croquetas con caldo",
    quantity: "150 g",
    preparation: "Mezclar con agua tibia y probiótico.",
    notes: "Comer despacio.",
    active: true,
    created_by: "demo-user-1",
    created_at: subDays(now, 20).toISOString(),
    updated_at: subDays(now, 2).toISOString()
  },
  {
    id: "meal-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Cena",
    food_type: "Lata gastrointestinal",
    quantity: "120 g",
    preparation: "Servir a temperatura ambiente.",
    notes: null,
    active: true,
    created_by: "demo-user-2",
    created_at: subDays(now, 18).toISOString(),
    updated_at: subDays(now, 1).toISOString()
  }
];

export const demoMealChecks: Array<MealCheck & { completed_by_name?: string | null }> = [
  {
    id: "meal-check-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    meal_id: "meal-1",
    schedule_id: "meal-schedule-1",
    scheduled_at: atTime("08:00"),
    completed_at: atTime("08:12"),
    status: "dada",
    completed_by: "demo-user-2",
    notes: "Comió todo sin problema.",
    created_at: isoNow,
    updated_at: isoNow,
    completed_by_name: "Mar"
  },
  {
    id: "meal-check-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    meal_id: "meal-2",
    schedule_id: "meal-schedule-2",
    scheduled_at: atTime("19:30"),
    completed_at: null,
    status: "pendiente",
    completed_by: null,
    notes: null,
    created_at: isoNow,
    updated_at: isoNow,
    completed_by_name: null
  }
];

export const demoMedications: Medication[] = [
  {
    id: "med-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Enrofloxacina",
    dosage: "1/2 pastilla",
    frequency: "Cada 12 horas",
    instructions: "Dar con comida.",
    start_date: subDays(now, 3).toISOString().slice(0, 10),
    end_date: addDays(now, 4).toISOString().slice(0, 10),
    prescription_photo_url: null,
    active: true,
    created_by: "demo-user-1",
    created_at: subDays(now, 3).toISOString(),
    updated_at: subDays(now, 1).toISOString()
  },
  {
    id: "med-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Probiótico",
    dosage: "1 sobre",
    frequency: "Diario",
    instructions: "Mezclar con el desayuno.",
    start_date: subDays(now, 7).toISOString().slice(0, 10),
    end_date: addDays(now, 10).toISOString().slice(0, 10),
    prescription_photo_url: null,
    active: true,
    created_by: "demo-user-2",
    created_at: subDays(now, 7).toISOString(),
    updated_at: subDays(now, 1).toISOString()
  }
];

export const demoMedicationChecks: Array<MedicationCheck & { completed_by_name?: string | null }> = [
  {
    id: "med-check-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    medication_id: "med-1",
    schedule_id: "med-schedule-1",
    scheduled_at: atTime("09:00"),
    completed_at: atTime("09:03"),
    status: "dada",
    completed_by: "demo-user-1",
    notes: "Sin resistencia.",
    created_at: isoNow,
    updated_at: isoNow,
    completed_by_name: "Isa"
  },
  {
    id: "med-check-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    medication_id: "med-2",
    schedule_id: "med-schedule-2",
    scheduled_at: atTime("20:00"),
    completed_at: null,
    status: "pendiente",
    completed_by: null,
    notes: null,
    created_at: isoNow,
    updated_at: isoNow,
    completed_by_name: null
  }
];

export const demoSupplies: Supply[] = [
  {
    id: "supply-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Croquetas gastrointestinal",
    category: "Comida",
    purchase_date: subDays(now, 12).toISOString().slice(0, 10),
    estimated_runout_date: addDays(now, 3).toISOString().slice(0, 10),
    quantity: "1 saco de 8 kg",
    price: 1299,
    store: "Costco",
    photo_url: null,
    notes: "Queda menos de 1/4.",
    status: "pronto_se_acaba",
    created_by: "demo-user-1",
    created_at: subDays(now, 12).toISOString(),
    updated_at: subDays(now, 2).toISOString()
  },
  {
    id: "supply-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Toallitas",
    category: "Higiene",
    purchase_date: subDays(now, 30).toISOString().slice(0, 10),
    estimated_runout_date: addDays(now, 1).toISOString().slice(0, 10),
    quantity: "1 paquete",
    price: 89,
    store: "Amazon",
    photo_url: null,
    notes: "Urgente para esta semana.",
    status: "urgente",
    created_by: "demo-user-2",
    created_at: subDays(now, 30).toISOString(),
    updated_at: subDays(now, 1).toISOString()
  }
];

export const demoVaccines: Vaccine[] = [
  {
    id: "vaccine-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Séxtuple",
    applied_at: subDays(now, 200).toISOString().slice(0, 10),
    next_due_date: addDays(now, 9).toISOString().slice(0, 10),
    document_url: null,
    notes: "Refuerzo programado.",
    created_by: "demo-user-1",
    created_at: subDays(now, 200).toISOString()
  },
  {
    id: "vaccine-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    name: "Rabia",
    applied_at: subDays(now, 220).toISOString().slice(0, 10),
    next_due_date: addDays(now, 40).toISOString().slice(0, 10),
    document_url: null,
    notes: null,
    created_by: "demo-user-1",
    created_at: subDays(now, 220).toISOString()
  }
];

export const demoVetVisits: VetVisit[] = [
  {
    id: "visit-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    visit_date: subDays(now, 5).toISOString().slice(0, 10),
    vet_name: "Dra. Morales",
    reason: "Diarrea leve",
    diagnosis: "Colitis por cambio de dieta",
    treatment: "Probiótico y dieta blanda 5 días",
    weight: 6.2,
    notes: "Vigilar apetito y heces.",
    created_by: "demo-user-1",
    created_at: subDays(now, 5).toISOString(),
    updated_at: subDays(now, 5).toISOString()
  },
  {
    id: "visit-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    visit_date: subDays(now, 45).toISOString().slice(0, 10),
    vet_name: "Clínica San Jorge",
    reason: "Vacunación anual",
    diagnosis: "Sin hallazgos relevantes",
    treatment: "Seguimiento normal",
    weight: 6.1,
    notes: null,
    created_by: "demo-user-2",
    created_at: subDays(now, 45).toISOString(),
    updated_at: subDays(now, 45).toISOString()
  }
];

export const demoStoolLogs = [
  {
    id: "stool-1",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    photo_url: "https://placehold.co/600x600/e7d2b6/6b4e3d?text=Registro+1",
    consistency: "blanda" as const,
    color: "#8B4513",
    has_blood: false,
    has_mucus: true,
    strong_smell: false,
    notes: "Más suave de lo normal, pero sin sangre.",
    occurred_at: subDays(now, 1).toISOString(),
    created_by: "demo-user-2",
    created_at: subDays(now, 1).toISOString(),
    updated_at: subDays(now, 1).toISOString(),
    photo_signed_url: "https://placehold.co/600x600/e7d2b6/6b4e3d?text=Registro+1",
    created_by_name: "Mar"
  },
  {
    id: "stool-2",
    household_id: "demo-household-1",
    pet_id: "demo-pet-1",
    photo_url: "https://placehold.co/600x600/d8c3a5/5c4033?text=Registro+2",
    consistency: "normal" as const,
    color: "#5C4033",
    has_blood: false,
    has_mucus: false,
    strong_smell: false,
    notes: "Se vio normal.",
    occurred_at: subDays(now, 2).toISOString(),
    created_by: "demo-user-1",
    created_at: subDays(now, 2).toISOString(),
    updated_at: subDays(now, 2).toISOString(),
    photo_signed_url: "https://placehold.co/600x600/d8c3a5/5c4033?text=Registro+2",
    created_by_name: "Isa"
  }
];

export const demoActivity: FamilyActivityItem[] = [
  {
    id: "activity-1",
    title: "Medicina dada",
    subtitle: "Enrofloxacina por la mañana",
    created_at: atTime("09:03"),
    relative_label: relativeFromNow(atTime("09:03")),
    icon: "medication"
  },
  {
    id: "activity-2",
    title: "Comida dada",
    subtitle: "Desayuno completo",
    created_at: atTime("08:12"),
    relative_label: relativeFromNow(atTime("08:12")),
    icon: "meal"
  },
  {
    id: "activity-3",
    title: "Registro de heces",
    subtitle: "Blanda con un poco de moco",
    created_at: subDays(now, 1).toISOString(),
    relative_label: relativeFromNow(subDays(now, 1).toISOString()),
    icon: "stool"
  },
  {
    id: "activity-4",
    title: "Consulta veterinaria",
    subtitle: "Dra. Morales",
    created_at: subDays(now, 5).toISOString(),
    relative_label: relativeFromNow(subDays(now, 5).toISOString()),
    icon: "vet"
  }
];

export const demoChecks: DayCheckItem[] = [
  {
    id: "day-check-1",
    type: "meal",
    title: "Desayuno",
    subtitle: "08:00 • 150 g",
    scheduledAt: atTime("08:00"),
    status: "dada",
    checkId: "meal-check-1",
    notes: "Comió todo sin problema.",
    completedAt: atTime("08:12"),
    completedByName: "Mar"
  },
  {
    id: "day-check-2",
    type: "medication",
    title: "Enrofloxacina",
    subtitle: "09:00 • 1/2 pastilla",
    scheduledAt: atTime("09:00"),
    status: "dada",
    checkId: "med-check-1",
    notes: "Sin resistencia.",
    completedAt: atTime("09:03"),
    completedByName: "Isa"
  },
  {
    id: "day-check-3",
    type: "meal",
    title: "Cena",
    subtitle: "19:30 • 120 g",
    scheduledAt: atTime("19:30"),
    status: "pendiente",
    checkId: "meal-check-2",
    notes: null
  },
  {
    id: "day-check-4",
    type: "medication",
    title: "Probiótico",
    subtitle: "20:00 • 1 sobre",
    scheduledAt: atTime("20:00"),
    status: "pendiente",
    checkId: "med-check-2",
    notes: null
  }
];

export const demoAlerts = [
  {
    id: "alert-1",
    tone: "urgent",
    title: "Toallitas: urge reponer",
    description: `Estimado para ${addDays(now, 1).toISOString().slice(0, 10)}`
  },
  {
    id: "alert-2",
    tone: "soft",
    title: "Croquetas gastrointestinal: se está acabando",
    description: `Estimado para ${addDays(now, 3).toISOString().slice(0, 10)}`
  },
  {
    id: "alert-3",
    tone: "calm",
    title: "Próxima vacuna: Séxtuple",
    description: `Fecha estimada ${addDays(now, 9).toISOString().slice(0, 10)}`
  },
  {
    id: "alert-4",
    tone: "soft",
    title: "Enrofloxacina termina pronto",
    description: `Último día ${addDays(now, 4).toISOString().slice(0, 10)}`
  }
];

export function getDemoTodayDashboardData() {
  return {
    checks: demoChecks,
    alerts: demoAlerts,
    activity: demoActivity,
    todayLabel: formatLongDate(new Date()),
    supplies: demoSupplies,
    vaccines: demoVaccines
  };
}

export function getDemoMealsPageData() {
  return {
    meals: demoMeals,
    schedules: [],
    checks: demoMealChecks
  };
}

export function getDemoMedicationsPageData() {
  return {
    medications: demoMedications,
    schedules: [],
    checks: demoMedicationChecks
  };
}

export function getDemoVetPageData() {
  return {
    visits: demoVetVisits,
    vaccines: demoVaccines,
    documents: []
  };
}

export function getDemoFamilyPageData() {
  return {
    members: demoMembers,
    recentActivity: demoActivity
  };
}

export function getDemoSummaryData() {
  return {
    symptoms: [
      {
        id: "symptom-1",
        type: "comio_poco",
        severity: "media",
        notes: "Comió menos por la tarde."
      },
      {
        id: "symptom-2",
        type: "vomito",
        severity: "leve",
        notes: "Un episodio aislado hace 6 días."
      }
    ],
    stools: demoStoolLogs,
    meals: demoMeals,
    mealChecks: demoMealChecks,
    medications: demoMedications,
    medicationChecks: demoMedicationChecks,
    vetVisits: demoVetVisits,
    vaccines: demoVaccines
  };
}
