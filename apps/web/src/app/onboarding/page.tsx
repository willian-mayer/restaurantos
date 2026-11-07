
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function OnboardingPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          Restaurant Setup
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Set up your restaurant
        </h1>

        <p className="mt-3 text-slate-600">
          Your account is ready. Next, we will create
          your restaurant and configure your workspace.
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          Restaurant onboarding is coming next.
        </div>
      </section>
    </main>
  );
}
