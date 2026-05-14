"use server";

import { redirect } from "next/navigation";

import { authenticateUser, clearSession, createSession } from "@/lib/auth/session";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  const identifier = getString(formData, "identifier") || getString(formData, "email");
  const password = getString(formData, "password");
  const user = await authenticateUser(identifier, password);

  if (!user) {
    redirect("/login?error=invalid_credentials");
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}