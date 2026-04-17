import { Op } from "sequelize";

import { ensureAppReady } from "@/lib/core/bootstrap";
import {
  issueCategories,
  issuePriorities,
  type IssueCategory,
  type IssuePriority,
  type IssueStatus,
  type UserRole,
} from "@/lib/core/config";
import { Issue, User } from "@/lib/data/models";
import { createNotification } from "@/lib/notifications/service";

export async function listDashboardIssues(role: UserRole, userId: string) {
  await ensureAppReady();

  if (role === "student") {
    return Issue.findAll({
      where: { studentId: userId },
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "department"] },
        { model: User, as: "supervisor", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  if (role === "technician") {
    return Issue.findAll({
      where: { assignedToId: userId },
      include: [{ model: User, as: "student", attributes: ["id", "name", "department"] }],
      order: [["updatedAt", "DESC"]],
    });
  }

  return Issue.findAll({
    include: [
      { model: User, as: "student", attributes: ["id", "name", "department"] },
      { model: User, as: "assignee", attributes: ["id", "name", "department"] },
      { model: User, as: "supervisor", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  });
}

export async function createIssue(input: {
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  priority: IssuePriority;
  studentId: string;
}) {
  await ensureAppReady();

  if (!issueCategories.includes(input.category)) {
    throw new Error("Unsupported issue category.");
  }

  if (!issuePriorities.includes(input.priority)) {
    throw new Error("Unsupported issue priority.");
  }

  const issue = await Issue.create({
    ...input,
    status: "open",
  });

  const supervisors = await User.findAll({ where: { role: "supervisor" } });

  await Promise.all(
    supervisors.map((supervisor) =>
      createNotification({
        userId: supervisor.id,
        title: `New issue ${issue.reference}`,
        message: `${input.title} was reported at ${input.location}.`,
        type: "issue.created",
        sendEmailCopy: true,
      }),
    ),
  );

  return issue;
}

export async function assignIssue(input: {
  issueId: string;
  assignedToId: string;
  assignedById: string;
}) {
  await ensureAppReady();
  const issue = await Issue.findByPk(input.issueId);

  if (!issue) {
    throw new Error("Issue not found.");
  }

  issue.assignedToId = input.assignedToId;
  issue.assignedById = input.assignedById;
  issue.status = issue.status === "open" ? "triaged" : issue.status;
  await issue.save();

  await createNotification({
    userId: input.assignedToId,
    title: `Issue assigned: ${issue.reference}`,
    message: `${issue.title} has been assigned to you for execution.`,
    type: "issue.assigned",
    sendEmailCopy: true,
  });

  await createNotification({
    userId: issue.studentId,
    title: `Issue triaged: ${issue.reference}`,
    message: `${issue.title} has been assigned to a technician.`,
    type: "issue.triaged",
  });

  return issue;
}

export async function updateIssueStatus(input: {
  issueId: string;
  status: IssueStatus;
  actorId: string;
  resolutionNotes?: string;
}) {
  await ensureAppReady();
  const issue = await Issue.findByPk(input.issueId);

  if (!issue) {
    throw new Error("Issue not found.");
  }

  issue.status = input.status;

  if (input.status === "resolved") {
    issue.resolutionNotes = input.resolutionNotes ?? "Resolved by technician.";
    issue.resolvedAt = new Date();
  }

  await issue.save();

  await createNotification({
    userId: issue.studentId,
    title: `Issue updated: ${issue.reference}`,
    message: `${issue.title} is now marked as ${input.status.replaceAll("_", " ")}.`,
    type: "issue.status_changed",
    sendEmailCopy: input.status === "resolved",
  });

  if (issue.assignedById && issue.assignedById !== input.actorId) {
    await createNotification({
      userId: issue.assignedById,
      title: `Progress update on ${issue.reference}`,
      message: `${issue.title} is now ${input.status.replaceAll("_", " ")}.`,
      type: "issue.status_changed",
    });
  }

  return issue;
}

export async function getTechnicians() {
  await ensureAppReady();

  return User.findAll({
    where: { role: "technician" },
    order: [["department", "ASC"], ["name", "ASC"]],
  });
}

export async function getUserDirectory() {
  await ensureAppReady();

  return User.findAll({
    where: {
      role: {
        [Op.in]: ["student", "technician", "supervisor", "admin"],
      },
    },
    order: [["role", "ASC"], ["name", "ASC"]],
  });
}