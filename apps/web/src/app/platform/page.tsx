
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/auth/get-platform-admin";
import { getRestaurantContexts } from "@/lib/auth/get-restaurant-context";

export const instant = false;

export default async function PlatformPage() {
  // ---------------------------------------------
  // 1. Ensure this page is rendered dynamically
  // ---------------------------------------------

  await connection();

  // ---------------------------------------------
  // 2. Validate authenticated user
  // ---------------------------------------------

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // ---------------------------------------------
  // 3. Validate Platform Admin permissions
  // ---------------------------------------------

  const isAdmin = await isPlatformAdmin();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  // ---------------------------------------------
  // 4. Load restaurants belonging to this user
  // ---------------------------------------------

  const restaurants = await getRestaurantContexts();

  // ---------------------------------------------
  // 5. Platform overview cards
  // ---------------------------------------------

  const platformSections = [
    {
      title: "Restaurants",
      description: "Manage registered restaurants",
    },
    {
      title: "Owners",
      description: "Manage restaurant owners",
    },
    {
      title: "Platform Analytics",
      description: "Monitor platform performance",
    },
  ];

  // ---------------------------------------------
  // 6. Render Platform Dashboard
  // ---------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                RestaurantOS Platform
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Platform Dashboard
              </h1>

              <p className="mt-2 text-slate-600">
                Welcome to your platform administration panel.
              </p>
            </div>

            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Platform Admin
            </span>
          </div>
        </header>

        {/* Platform management cards */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Platform Management
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {platformSections.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {item.description}
                </p>

                <p className="mt-6 text-xs font-medium text-slate-400">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Restaurant workspaces */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Your Restaurant Workspaces
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Switch to a restaurant where you have an active
                membership.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {restaurants.length}{" "}
              {restaurants.length === 1
                ? "Restaurant"
                : "Restaurants"}
            </span>
          </div>

          {restaurants.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.tenantId}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-5 transition-colors hover:border-slate-300"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {restaurant.restaurantName}
                      </h3>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                        {restaurant.role}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Restaurant Management
                    </p>

                    <p className="mt-3 break-all text-xs text-slate-400">
                      {restaurant.restaurantSlug}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/${restaurant.tenantId}`}
                    className="inline-flex w-fit items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                  >
                    Open Restaurant
                    <span aria-hidden="true" className="ml-2">
                      →
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
              <p className="font-medium text-slate-700">
                No restaurant workspaces yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                You do not currently have an active membership
                in a restaurant.
              </p>

              <Link
                href="/onboarding"
                className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Restaurant
              </Link>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-400">
            RestaurantOS — Platform Administration
          </p>
        </footer>
      </div>
    </main>
  );
}
