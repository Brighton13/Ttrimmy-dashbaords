import crypto from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { appConfig, roleLabels, type UserRole } from "@/lib/core/config";
import { ensureAppReady } from "@/lib/core/bootstrap";
import { User } from "@/lib/data/models";
import { createRealtimeToken } from "@/lib/realtime/token";

export const SESSION_COOKIE = "ttrimmy_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  studentId?: string | null;
  employeeId?: string | null;
  role: UserRole;
  department: string | null;
};

export type AppSession = {
  user: SessionUser;
  realtimeToken: string;
};

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SessionUser>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.length > 0 &&
    typeof candidate.email === "string" &&
    candidate.email.length > 0 &&
    (candidate.studentId === undefined || candidate.studentId === null || typeof candidate.studentId === "string") &&
    (candidate.employeeId === undefined || candidate.employeeId === null || typeof candidate.employeeId === "string") &&
    typeof candidate.role === "string" &&
    candidate.role in roleLabels &&
    (candidate.department === null || typeof candidate.department === "string")
  );
}

export function getPreferredLoginIdentifier(user: {
  email: string;
  studentId?: string | null;
  employeeId?: string | null;
}) {
  return user.studentId ?? user.employeeId ?? user.email;
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", appConfig.sessionSecret)
    .update(value)
    .digest("hex");
}

function encode(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string): SessionUser | null {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, encode(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  const user = decode(raw);

  if (!isSessionUser(user)) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return {
    user,
    realtimeToken: createRealtimeToken(user),
  };
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();

  if (!roles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}

export function roleDescription(role: UserRole) {
  return roleLabels[role];
}

export async function authenticateUser(identifier: string, password: string) {
  await ensureAppReady();
  const normalizedIdentifier = identifier.trim();
  const normalizedEmail = normalizedIdentifier.toLowerCase();
  const normalizedLoginId = normalizedIdentifier.toUpperCase();

  const userByEmail = await User.findOne({ where: { email: normalizedEmail } });
  const userByStudentId = userByEmail
    ? null
    : await User.findOne({ where: { studentId: normalizedLoginId } });
  const user = userByStudentId
    ?? userByEmail
    ?? await User.findOne({ where: { employeeId: normalizedLoginId } });

  if (!user) {
    return null;
  }

  const bcrypt = await import("bcryptjs");
  const matches = await bcrypt.compare(password, user.passwordHash);

  if (!matches) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    employeeId: user.employeeId,
    role: user.role,
    department: user.department,
  } satisfies SessionUser;
}