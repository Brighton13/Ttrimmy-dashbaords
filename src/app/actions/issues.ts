"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/session";
import { issueCategories, issuePriorities, issueStatuses } from "@/lib/core/config";
import { assignIssue, createIssue, sendIssueMessage, updateIssueStatus } from "@/lib/services/issues";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createIssueAction(formData: FormData) {
  const session = await requireRole(["student"]);
  const category = getString(formData, "category");

  if (!issueCategories.includes(category as (typeof issueCategories)[number])) {
    redirect("/dashboard/issues?error=category");
  }

  await createIssue({
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    category: category as (typeof issueCategories)[number],
    location: getString(formData, "location"),
    studentId: session.user.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/issues");
  redirect("/dashboard/issues?created=1");
}

export async function assignIssueAction(formData: FormData) {
  const session = await requireRole(["supervisor"]);
  const priority = getString(formData, "priority");

  if (!issuePriorities.includes(priority as (typeof issuePriorities)[number])) {
    redirect("/dashboard/issues?error=priority");
  }

  await assignIssue({
    issueId: getString(formData, "issueId"),
    assignedToId: getString(formData, "assignedToId"),
    assignedBy: session.user,
    priority: priority as (typeof issuePriorities)[number],
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/issues");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/issues?assigned=1");
}

export async function updateIssueStatusAction(formData: FormData) {
  const session = await requireRole(["technician", "supervisor"]);
  const status = getString(formData, "status");

  if (!issueStatuses.includes(status as (typeof issueStatuses)[number])) {
    redirect("/dashboard/tasks?error=status");
  }

  await updateIssueStatus({
    issueId: getString(formData, "issueId"),
    actor: session.user,
    status: status as (typeof issueStatuses)[number],
    resolutionNotes: getString(formData, "resolutionNotes"),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/issues");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/tasks?updated=1");
}

export async function sendIssueMessageAction(formData: FormData) {
  const session = await requireRole(["student", "technician"]);
  const issueId = getString(formData, "issueId");
  const body = getString(formData, "body");
  const returnPath = getString(formData, "returnPath") || "/dashboard/issues";

  try {
    await sendIssueMessage({
      issueId,
      sender: session.user,
      body,
    });
  } catch (error) {
    const reason = error instanceof Error
      ? error.message.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_+|_+$/g, "")
      : "message_failed";

    redirect(`${returnPath}?error=${reason}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/issues");
  revalidatePath("/dashboard/tasks");
  redirect(`${returnPath}?messaged=1`);
}