
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getRestaurantContexts } from "@/lib/auth/get-restaurant-context";
import { isPlatformAdmin } from "@/lib/auth/get-platform-admin";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";

export const instant = false;

type Props = {
  children: React.ReactNode;
  params: Promise<{
    tenantId: string;
  }>;
};

export default async function RestaurantLayout({
  children,
  params,
}: Props) {
  await connection();

  const { tenantId } = await params;

  const restaurants = await getRestaurantContexts();

  const activeRestaurant = restaurants.find(
    (restaurant) => restaurant.tenantId === tenantId
  );

  if (!activeRestaurant) {
    redirect("/auth/continue");
  }

  const platformAdmin = await isPlatformAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeRestaurant.restaurantName}
            </h1>
            <p className="text-sm text-slate-500">
              Restaurant Management
            </p>
          </div>

          <div className="w-full max-w-xs">
            <WorkspaceSwitcher
              restaurants={restaurants}
              activeTenantId={tenantId}
              isPlatformAdmin={platformAdmin}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  );
}
