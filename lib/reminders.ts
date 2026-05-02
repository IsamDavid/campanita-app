import { addMinutes, parseISO } from "date-fns";

import { getSupabaseServiceClient } from "@/lib/supabaseServer";
import { sendWebPushToHousehold } from "@/lib/notifications";

export async function syncReminderForSchedule({
  householdId,
  petId,
  type,
  relatedId,
  title,
  body,
  scheduledAt,
  reminderMinutesBefore,
  createdBy
}: {
  householdId: string;
  petId: string;
  type: "meal" | "medication" | "care";
  relatedId: string;
  title: string;
  body: string;
  scheduledAt: string;
  reminderMinutesBefore: number;
  createdBy: string;
}) {
  const supabase = getSupabaseServiceClient();
  const remindAt = addMinutes(parseISO(scheduledAt), reminderMinutesBefore * -1).toISOString();

  await supabase.from("reminders").upsert(
    {
      household_id: householdId,
      pet_id: petId,
      type,
      related_id: relatedId,
      title,
      body,
      remind_at: remindAt,
      created_by: createdBy
    },
    { onConflict: "household_id,related_id,remind_at" }
  );
}

export async function processPendingReminders() {
  const supabase = getSupabaseServiceClient();
  const now = new Date().toISOString();

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("status", "pending")
    .lte("remind_at", now)
    .is("sent_at", null)
    .limit(25);

  const results = [];

  for (const reminder of reminders ?? []) {
    const pushResult = await sendWebPushToHousehold(reminder.household_id, {
      title: reminder.title,
      body: reminder.body ?? "Tienes un pendiente de Campanita.",
      url: "/hoy"
    });

    await supabase
      .from("reminders")
      .update({
        sent_at: new Date().toISOString(),
        status: pushResult.skipped ? "pending" : "sent"
      })
      .eq("id", reminder.id);

    results.push({
      id: reminder.id,
      ...pushResult
    });
  }

  return results;
}
