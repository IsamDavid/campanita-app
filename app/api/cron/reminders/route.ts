import { NextResponse } from "next/server";

import { canEdit, getAppContext } from "@/lib/auth";
import { processPendingReminders } from "@/lib/reminders";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const isCron = request.headers.get("x-vercel-cron") === "1";
  const context = await getAppContext();

  if (!isCron && !context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCron && context && !canEdit(context.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await processPendingReminders();
  return NextResponse.json({ processed: results.length, results });
}
