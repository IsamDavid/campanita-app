import { NextResponse } from "next/server";

import { canEdit, getAppContext } from "@/lib/auth";
import { processPendingReminders } from "@/lib/reminders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const isCron = request.headers.get("x-vercel-cron") === "1";
  const configuredSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const requestSecret =
    authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : new URL(request.url).searchParams.get("secret");
  const hasCronSecret = Boolean(configuredSecret && requestSecret === configuredSecret);
  const context = await getAppContext();

  if (!isCron && !hasCronSecret && !context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCron && !hasCronSecret && context && !canEdit(context.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await processPendingReminders();
  return NextResponse.json({ processed: results.length, results });
}
