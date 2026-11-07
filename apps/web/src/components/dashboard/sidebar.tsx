
import Link from "next/link";
import LogoutButton from "./logout-button";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: "🏠" },
  { label: "Tables", href: "/dashboard/tables", icon: "🪑" },
  { label: "Orders", href: "/dashboard/orders", icon: "🧾" },
  { label: "Menu", href: "/dashboard/menu", icon: "🍽️" },
  { label: "Staff", href: "/dashboard/staff", icon: "👥" },
  { label: "Analytics", href: "/dashboard/reports", icon: "📊" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
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
