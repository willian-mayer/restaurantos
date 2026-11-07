
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

const stats = [
  { label: "Today's Revenue", value: "—", icon: "💰" },
  { label: "Active Orders", value: "—", icon: "🧾" },
  { label: "Occupied Tables", value: "—", icon: "🪑" },
  { label: "Guests Served", value: "—", icon: "👥" },
];

export default async function DashboardPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Dashboard Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Welcome to RestaurantOS 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Signed in as {user.email}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 text-3xl">{stat.icon}</div>

            <p className="text-sm text-slate-500">
              {stat.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Orders
          </h2>

          <p className="mt-6 text-sm text-slate-500">
            No orders to display yet.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Table Status
          </h2>

          <p className="mt-6 text-sm text-slate-500">
            Set up your restaurant to start managing tables.
          </p>
        </section>
      </div>
    </div>
  );
}
