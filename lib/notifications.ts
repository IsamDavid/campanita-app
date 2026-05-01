import { getSupabaseServiceClient } from "@/lib/supabaseServer";

export async function getWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return null;
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export async function sendWebPushToHousehold(
  householdId: string,
  payload: Record<string, unknown>
) {
  const webPush = await getWebPush();
  if (!webPush) {
    return { sent: 0, failed: 0, skipped: true };
  }

  const supabase = getSupabaseServiceClient();
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("household_id", householdId);

  let sent = 0;
  let failed = 0;

  for (const item of subscriptions ?? []) {
    const subscription = {
      endpoint: item.endpoint,
      keys: {
        p256dh: item.p256dh,
        auth: item.auth
      }
    };

    try {
      await webPush.sendNotification(subscription, JSON.stringify(payload));
      sent += 1;
    } catch (error) {
      failed += 1;
      const statusCode = typeof error === "object" && error !== null && "statusCode" in error
        ? Number(error.statusCode)
        : 0;

      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", item.id);
      }
    }
  }

  return { sent, failed, skipped: false };
}
