
import { createClient } from "@/lib/supabase/server";

const stats = [
  { label: "Ventas de hoy", value: "—", icon: "💰" },
  { label: "Pedidos activos", value: "—", icon: "🧾" },
  { label: "Mesas ocupadas", value: "—", icon: "🪑" },
  { label: "Clientes atendidos", value: "—", icon: "👥" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Panel administrativo
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Bienvenido a RestaurantOS 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Sesión iniciada como {user?.email}
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
            Pedidos recientes
          </h2>

          <p className="mt-6 text-sm text-slate-500">
            Todavía no hay pedidos para mostrar.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Estado de las mesas
          </h2>

          <p className="mt-6 text-sm text-slate-500">
            Configura tu restaurante para comenzar
            a administrar las mesas.
          </p>
        </section>
      </div>
    </div>
  );
}
