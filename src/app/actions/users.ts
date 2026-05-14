"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, requireRole } from "@/lib/auth/session";
import { ensureAppReady } from "@/lib/core/bootstrap";
import { userRoles, type UserRole } from "@/lib/core/config";
import { User } from "@/lib/data/models";
import { validateUserDepartment } from "@/lib/services/issues";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}

function toErrorCode(error: unknown) {
  if (!(error instanceof Error)) {
    return "request_failed";
  }

  return error.message.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_+|_+$/g, "");
}

export async function createUserAction(formData: FormData) {
  await requireRole(["admin"]);
  await ensureAppReady();

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  let password = getString(formData, "password");
  const role = getString(formData, "role");
  const department = getString(formData, "department");

  if (!name || !email || !isUserRole(role)) {
    redirect("/dashboard/users?error=missing_fields");
  }

  try {
    await validateUserDepartment(role, department);

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      redirect("/dashboard/users?error=email_in_use");
    }

    if(role == "student"){
      password = "1234";
    }else if(role == "technician") {
        password = "Technician123";
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      passwordHash,
      role,
      department: department || null,
    });
  } catch (error) {
    redirect(`/dashboard/users?error=${toErrorCode(error)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?created=1");
}

export async function updateUserAction(formData: FormData) {
  const session = await requireRole(["admin"]);
  await ensureAppReady();

  const userId = getString(formData, "userId");
  const role = getString(formData, "role");
  const department = getString(formData, "department");

  if (!userId || !isUserRole(role)) {
    redirect("/dashboard/users?error=missing_fields");
  }

  try {
    await validateUserDepartment(role, department);

    const user = await User.findByPk(userId);

    if (!user) {
      redirect("/dashboard/users?error=user_not_found");
    }

    user.role = role;
    user.department = department || null;
    await user.save();

    if (user.id === session.user.id) {
      await createSession({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      });
    }
  } catch (error) {
    redirect(`/dashboard/users?error=${toErrorCode(error)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?updated=1");
}