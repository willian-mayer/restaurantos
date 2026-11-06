
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/sidebar";

// Permite renderizado bloqueante para esta ruta.
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar email={user.email ?? ""} />

      <main className="min-w-0 flex-1 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
