
"use client";

import { useRouter } from "next/navigation";
import type { RestaurantContext } from "@/lib/auth/get-restaurant-context";

type WorkspaceSwitcherProps = {
  restaurants: RestaurantContext[];
  activeTenantId: string;
  isPlatformAdmin: boolean;
};

export function WorkspaceSwitcher({
  restaurants,
  activeTenantId,
  isPlatformAdmin,
}: WorkspaceSwitcherProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <label
        htmlFor="workspace"
        className="block text-xs font-medium text-slate-500"
      >
        Workspace
      </label>

      <select
        id="workspace"
        value={activeTenantId}
        onChange={(event) => {
          const value = event.target.value;

          if (value === "platform") {
            router.push("/platform");
            return;
          }

          router.push(
            `/dashboard/${encodeURIComponent(value)}`
          );
        }}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
      >
        {isPlatformAdmin && (
          <option value="platform">
            Platform Administration
          </option>
        )}

        {restaurants.map((restaurant) => (
          <option
            key={restaurant.tenantId}
            value={restaurant.tenantId}
          >
            {restaurant.restaurantName} ({restaurant.role})
          </option>
        ))}
      </select>
    </div>
  );
}
