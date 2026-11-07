
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getRestaurantContext } from "@/lib/auth/get-restaurant-context";

export const instant = false;

type Props = {
  params: Promise<{
    tenantId: string;
  }>;
};

export default async function RestaurantDashboard({
  params,
}: Props) {
  await connection();

  const { tenantId } = await params;

  const restaurant = await getRestaurantContext(tenantId);

  if (!restaurant) {
    redirect("/auth/continue");
  }

  const stats = [
    { label: "Active Tables", value: "0" },
    { label: "Open Orders", value: "0" },
    { label: "Pending Waiter Calls", value: "0" },
    { label: "Today's Revenue", value: "—" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Restaurant Overview
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome to {restaurant.restaurantName} 👋
        </h2>

        <p className="mt-2 text-slate-600">
          Here&apos;s what&apos;s happening at your restaurant today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <p className="text-sm text-slate-500">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">
          Restaurant Information
        </h3>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Restaurant</dt>
            <dd>{restaurant.restaurantName}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Your Role</dt>
            <dd className="capitalize">{restaurant.role}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Slug</dt>
            <dd className="break-all">
              {restaurant.restaurantSlug}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
