
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getRestaurantContexts } from "@/lib/auth/get-restaurant-context";
import { isPlatformAdmin } from "@/lib/auth/get-platform-admin";

export const instant = false;

export default async function DashboardRedirect() {
  await connection();

  const restaurants = await getRestaurantContexts();

  if (restaurants.length > 0) {
    redirect(
      `/dashboard/${restaurants[0].tenantId}`
    );
  }

  const platformAdmin = await isPlatformAdmin();

  if (platformAdmin) {
    redirect("/platform");
  }

  redirect("/onboarding");
}
