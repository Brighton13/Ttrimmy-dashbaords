import type { UserRole } from "@/lib/core/config";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: "overview" | "issues" | "tasks" | "users" | "settings";
};

export const dashboardNavByRole: Record<UserRole, DashboardNavItem[]> = {
  student: [
    { href: "/dashboard", label: "Dashboard", icon: "overview" },
    { href: "/dashboard/issues", label: "Requests", icon: "issues" },
  ],
  technician: [
    { href: "/dashboard", label: "Dashboard", icon: "overview" },
    { href: "/dashboard/tasks", label: "Tasks", icon: "tasks" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: "overview" },
    { href: "/dashboard/issues", label: "Issues", icon: "issues" },
    { href: "/dashboard/tasks", label: "Execution", icon: "tasks" },
    { href: "/dashboard/users", label: "Users", icon: "users" },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  ],
};

export const roleHeroCopy: Record<
  UserRole,
  { title: string; description: string; badge: string }
> = {
  student: {
    badge: "Student portal",
    title: "Track maintenance requests without chasing updates.",
    description:
      "Raise facility issues, monitor status, and see when your request has moved from pending into active resolution.",
  },
  technician: {
    badge: "Technician workspace",
    title: "Work through assigned jobs with clear ownership and status.",
    description:
      "Review your queue, move work through execution, and record completion notes that admins and students can trust.",
  },
  admin: {
    badge: "Admin control",
    title: "Manage users, review every issue, and keep execution on track.",
    description:
      "Provision accounts, assign work across departments, review workload trends, and keep the facility response process aligned with real operational demand.",
  },
};