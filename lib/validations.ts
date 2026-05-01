import { z } from "zod";

export const stoolLogSchema = z.object({
  consistency: z.enum(["liquida", "blanda", "normal", "dura"]),
  color: z.string().min(2, "Selecciona o describe el color"),
  has_blood: z.boolean(),
  has_mucus: z.boolean(),
  strong_smell: z.boolean(),
  notes: z.string().max(600).optional().or(z.literal("")),
  occurred_at: z.string().min(1, "La fecha es obligatoria")
});

export const mealSchema = z.object({
  name: z.string().min(2, "Escribe un nombre"),
  food_type: z.string().min(2, "Describe el tipo de comida"),
  quantity: z.string().min(1, "Indica la cantidad"),
  preparation: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  time_of_day: z.string().min(1, "Selecciona la hora"),
  reminder_minutes_before: z.coerce.number().min(0).max(240),
  days_of_week: z.array(z.number().min(0).max(6)).min(1, "Selecciona al menos un día")
});

export const medicationSchema = z.object({
  name: z.string().min(2, "Escribe el nombre"),
  dosage: z.string().min(1, "Indica la dosis"),
  frequency: z.string().min(1, "Indica la frecuencia"),
  instructions: z.string().max(500).optional().or(z.literal("")),
  start_date: z.string().min(1, "Fecha requerida"),
  end_date: z.string().optional().or(z.literal("")),
  time_of_day: z.string().min(1, "Selecciona la hora"),
  reminder_minutes_before: z.coerce.number().min(0).max(240),
  days_of_week: z.array(z.number().min(0).max(6)).min(1, "Selecciona al menos un día")
});

export const supplySchema = z.object({
  name: z.string().min(2, "Escribe el nombre"),
  category: z.string().min(2, "Escribe la categoría"),
  purchase_date: z.string().min(1, "Fecha requerida"),
  estimated_runout_date: z.string().optional().or(z.literal("")),
  quantity: z.string().min(1, "Indica la cantidad"),
  price: z.coerce.number().min(0).optional(),
  store: z.string().max(160).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["suficiente", "pronto_se_acaba", "urgente"])
});

export const vetVisitSchema = z.object({
  visit_date: z.string().min(1, "Fecha requerida"),
  vet_name: z.string().min(2, "Escribe el nombre de la veterinaria o médico"),
  reason: z.string().min(2, "Escribe el motivo"),
  diagnosis: z.string().optional().or(z.literal("")),
  treatment: z.string().optional().or(z.literal("")),
  weight: z.coerce.number().min(0).optional(),
  notes: z.string().max(600).optional().or(z.literal(""))
});

export const vaccineSchema = z.object({
  name: z.string().min(2, "Escribe la vacuna"),
  applied_at: z.string().min(1, "Fecha requerida"),
  next_due_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const quickSymptomSchema = z.object({
  type: z.string().min(2),
  severity: z.enum(["baja", "media", "alta"]).default("media"),
  notes: z.string().max(300).optional().or(z.literal(""))
});
