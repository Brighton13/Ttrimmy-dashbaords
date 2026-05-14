"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DashboardNavItem } from "@/lib/navigation";

function NavIcon({ icon }: { icon: DashboardNavItem["icon"] }) {
  const common = "h-4 w-4 stroke-current";

  if (icon === "overview") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24">
        <path d="M4 5h7v6H4zM13 5h7v10h-7zM4 13h7v6H4zM13 17h7v2h-7z" strokeWidth="1.8" />
      </svg>
    );
  }

  if (icon === "issues") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24">
        <path d="M6 5h12v14H6zM9 9h6M9 13h6M9 17h4" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "tasks") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24">
        <path d="M8 7h12M8 12h12M8 17h12M4 7l1.5 1.5L7.5 6M4 12l1.5 1.5L7.5 11M4 17l1.5 1.5L7.5 16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "users") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24">
        <path d="M8 11a3 3 0 100-6 3 3 0 000 6zM16 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3.5 19a4.5 4.5 0 019 0M13 19a3.5 3.5 0 017 0" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={common} fill="none" viewBox="0 0 24 24">
      <path d="M12 3v3M12 18v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M3 12h3M18 12h3M4.9 19.1L7 17M17 7l2.1-2.1" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
    </svg>
  );
}

export function DashboardNav({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
          >
            <NavIcon icon={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}