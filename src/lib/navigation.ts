import type { UserRole } from "@/lib/core/config";

export type DashboardNavItem = {
  href: string;
  label: string;
};

export const dashboardNavByRole: Record<UserRole, DashboardNavItem[]> = {
  student: [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/issues", label: "My Issues" },
  ],
  technician: [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/tasks", label: "My Tasks" },
  ],
  supervisor: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/issues", label: "Assignments" },
    { href: "/dashboard/tasks", label: "Team Progress" },
  ],
  admin: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/users", label: "People" },
    { href: "/dashboard/settings", label: "Platform" },
  ],
};

export const roleHeroCopy: Record<
  UserRole,
  { title: string; description: string; badge: string }
> = {
  student: {
    badge: "Student workspace",
    title: "Report a problem and track progress without the clutter.",
    description:
      "Log hostel and classroom maintenance issues, then follow assignment and resolution updates from one simple view.",
  },
  technician: {
    badge: "Technician workspace",
    title: "Focus on the jobs assigned to you and move them to done.",
    description:
      "See your queue, update job state, and leave clear resolution notes for the student and supervisor.",
  },
  supervisor: {
    badge: "Supervisor workspace",
    title: "Triage incoming issues and keep the team load balanced.",
    description:
      "Assign work quickly, watch the backlog, and spot delays before critical issues escalate.",
  },
  admin: {
    badge: "Admin workspace",
    title: "See the operating picture and make staffing and maintenance decisions.",
    description:
      "Monitor issue categories, backlog pressure, resolution speed, and platform readiness with a compact control view.",
  },
};