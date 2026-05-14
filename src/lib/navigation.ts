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
  supervisor: [
    { href: "/dashboard", label: "Dashboard", icon: "overview" },
    { href: "/dashboard/issues", label: "Assignments", icon: "issues" },
    { href: "/dashboard/tasks", label: "Execution", icon: "tasks" },
  ],
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: "overview" },
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
      "Review your queue, move work through execution, and record completion notes that supervisors and students can trust.",
  },
  supervisor: {
    badge: "Department control",
    title: "Route incoming work and keep departmental execution on track.",
    description:
      "Set priority, assign technicians in your department, and keep the backlog from drifting into service risk.",
  },
  admin: {
    badge: "Operations control",
    title: "Manage users and monitor service performance from one place.",
    description:
      "Provision accounts, review workload trends, and keep the facility response process aligned with real operational demand.",
  },
};