
import Link from "next/link";
import LogoutButton from "@/components/dashboard/logout-button";

const navigation = [
  { label: "Inicio", href: "/dashboard", icon: "🏠" },
  { label: "Mesas", href: "/dashboard/tables", icon: "🪑" },
  { label: "Pedidos", href: "/dashboard/orders", icon: "🧾" },
  { label: "Menú", href: "/dashboard/menu", icon: "🍽️" },
  { label: "Empleados", href: "/dashboard/staff", icon: "👥" },
  { label: "Reportes", href: "/dashboard/reports", icon: "📊" },
  { label: "Configuración", href: "/dashboard/settings", icon: "⚙️" },
];

export default function Sidebar({
  email,
}: {
  email: string;
}) {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 md:flex">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-slate-900">
          RestaurantOS
        </h1>
        <p className="text-xs text-slate-500">
          Restaurant Management
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-4 border-t border-slate-200 pt-5">
        <p className="truncate text-xs text-slate-500">
          {email}
        </p>
        <LogoutButton />
      </div>
    </aside>
  );
}
