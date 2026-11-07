
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/auth/get-platform-admin";

export const instant = false;

export default async function PlatformPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = await isPlatformAdmin();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm font-medium text-slate-500">
            RestaurantOS Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Platform Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Welcome to your platform administration panel.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {[
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
          ].map((item) => (
            <section
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {item.description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
