"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Users,
} from "lucide-react";

const navigationItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/modules",
    label: "Modules",
    icon: BookOpen,
  },
  {
    href: "/admin/quizzes",
    label: "Quizzes",
    icon: ClipboardList,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/progress",
    label: "Progress",
    icon: ListChecks,
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    icon: Activity,
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-emerald-100 text-emerald-800"
                : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            }`}
            href={item.href}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
