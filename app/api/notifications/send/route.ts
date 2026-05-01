import { NextResponse } from "next/server";

import { canEdit, getAppContext } from "@/lib/auth";
import { sendWebPushToHousehold } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const context = await getAppContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEdit(context.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const result = await sendWebPushToHousehold(context.household.id, {
    title: body.title || "Campanita",
    body: body.body || "Tienes un recordatorio pendiente.",
    url: body.url || "/hoy"
  });

  return NextResponse.json(result);
}
