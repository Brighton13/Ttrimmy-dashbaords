export const appConfig = {
  appName: "Facility Maintenance Tracking System",
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://postgres:root@localhost:5432/trimmy_db",
  sessionSecret:
    process.env.SESSION_SECRET ?? "replace-this-in-production-with-a-long-secret",
  smtpUrl: process.env.SMTP_URL,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number.parseInt(process.env.SMTP_PORT ?? "587", 10),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? "alerts@ttrimmy.local",
  redisUrl: process.env.REDIS_URL,
  publicBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export const roleLabels = {
  admin: "Administrator",
  student: "Student",
  supervisor: "Admin",
  technician: "Technician",
} as const;

export const userRoles = ["admin", "student", "supervisor", "technician"] as const;

export const issueCategories = [
  "Plumbing",
  "Electrical",
  "Windows",
  "Networking",
  "Furniture",
  "Safety",
] as const;

export const technicalDepartments = issueCategories;
export const technicalRoles = ["supervisor", "technician"] as const;

export const issueStatuses = [
  "open",
  "pending",
  "in_progress",
  "resolved",
] as const;

export const issuePriorities = ["low", "medium", "high", "critical"] as const;

export type UserRole = (typeof userRoles)[number];
export type IssueCategory = (typeof issueCategories)[number];
export type IssueStatus = (typeof issueStatuses)[number];
export type IssuePriority = (typeof issuePriorities)[number];