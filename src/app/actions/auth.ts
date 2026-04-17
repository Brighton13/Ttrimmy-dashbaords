"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authenticateUser, clearSession, createSession } from "@/lib/auth/session";
import { ensureAppReady } from "@/lib/core/bootstrap";
import { User } from "@/lib/data/models";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const user = await authenticateUser(email, password);

  if (!user) {
    redirect("/login?error=invalid_credentials");
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function registerStudentAction(formData: FormData) {
  await ensureAppReady();

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const department = getString(formData, "department");

  if (!name || !email || !password) {
    redirect("/login?error=missing_fields");
  }

  const existing = await User.findOne({ where: { email } });

  if (existing) {
    redirect("/login?error=email_in_use");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "student",
    department: department || "Residence",
  });

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  });

  revalidatePath("/");
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}