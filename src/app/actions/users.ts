"use server";

import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, requireRole } from "@/lib/auth/session";
import { ensureAppReady } from "@/lib/core/bootstrap";
import { userRoles, type UserRole } from "@/lib/core/config";
import { sequelize } from "@/lib/core/db";
import { Issue, IssueMessage, Notification, User } from "@/lib/data/models";
import { validateUserDepartment } from "@/lib/services/issues";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}

function buildFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim().replaceAll(/\s+/g, " ");
}

function toErrorCode(error: unknown) {
  if (!(error instanceof Error)) {
    return "request_failed";
  }

  return error.message.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_+|_+$/g, "");
}

export async function createUserAction(formData: FormData) {
  await requireRole(["supervisor"]);
  await ensureAppReady();

  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  const name = buildFullName(firstName, lastName);
  const email = getString(formData, "email").toLowerCase();
  let password = getString(formData, "password");
  const role = getString(formData, "role");
  const department = getString(formData, "department");

  if (!firstName || !lastName || !name || !email || !isUserRole(role)) {
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
  const session = await requireRole(["supervisor"]);
  await ensureAppReady();

  const userId = getString(formData, "userId");
  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  const name = buildFullName(firstName, lastName);
  const role = getString(formData, "role");
  const department = getString(formData, "department");

  if (!userId || !firstName || !lastName || !name || !isUserRole(role)) {
    redirect("/dashboard/users?error=missing_fields");
  }

  try {
    await validateUserDepartment(role, department);

    const user = await User.findByPk(userId);

    if (!user) {
      redirect("/dashboard/users?error=user_not_found");
    }

    user.name = name;
    user.role = role;
    user.department = department || null;
    await user.save();

    if (user.id === session.user.id) {
      await createSession({
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        employeeId: user.employeeId,
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

export async function deleteUserAction(formData: FormData) {
  const session = await requireRole(["supervisor"]);
  await ensureAppReady();

  const userId = getString(formData, "userId");

  if (!userId) {
    redirect("/dashboard/users?error=missing_fields");
  }

  if (userId === session.user.id) {
    redirect("/dashboard/users?error=cannot_delete_current_user");
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      redirect("/dashboard/users?error=user_not_found");
    }

    await sequelize.transaction(async (transaction) => {
      const submittedIssues = await Issue.findAll({
        where: { studentId: user.id },
        attributes: ["id"],
        transaction,
      });

      const submittedIssueIds = submittedIssues.map((issue) => issue.id);

      if (submittedIssueIds.length > 0) {
        await IssueMessage.destroy({
          where: { issueId: submittedIssueIds },
          transaction,
        });

        await Issue.destroy({
          where: { id: submittedIssueIds },
          transaction,
        });
      }

      await IssueMessage.destroy({
        where: { senderId: user.id },
        transaction,
      });

      await Notification.destroy({
        where: { userId: user.id },
        transaction,
      });

      await Issue.update(
        {
          assignedToId: null,
          status: "open",
        },
        {
          where: {
            assignedToId: user.id,
            status: { [Op.ne]: "resolved" },
          },
          transaction,
        },
      );

      await Issue.update(
        { assignedToId: null },
        {
          where: {
            assignedToId: user.id,
            status: "resolved",
          },
          transaction,
        },
      );

      await Issue.update(
        { assignedById: null },
        {
          where: { assignedById: user.id },
          transaction,
        },
      );

      await user.destroy({ transaction });
    });
  } catch (error) {
    redirect(`/dashboard/users?error=${toErrorCode(error)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/issues");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users?deleted=1");
}