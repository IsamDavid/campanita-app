import { redirect } from "next/navigation";

import { isDemoMode } from "@/lib/demo";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (isDemoMode) {
    redirect("/hoy");
  }
  const user = await getCurrentUser();
  redirect(user ? "/hoy" : "/login");
}
