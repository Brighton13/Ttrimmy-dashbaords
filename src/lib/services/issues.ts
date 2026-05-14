import { Op } from "sequelize";

import { ensureAppReady } from "@/lib/core/bootstrap";
import {
  issueCategories,
  issuePriorities,
  technicalDepartments,
  technicalRoles,
  type IssueCategory,
  type IssuePriority,
  type IssueStatus,
  type UserRole,
} from "@/lib/core/config";
import { Issue, User } from "@/lib/data/models";
import { createNotification } from "@/lib/notifications/service";

function getIssueDepartment(category: IssueCategory) {
  return category;
}

function isTechnicalRole(role: UserRole) {
  return technicalRoles.includes(role as (typeof technicalRoles)[number]);
}

function isTechnicalDepartment(department: string | null | undefined) {
  return technicalDepartments.includes(
    department as (typeof technicalDepartments)[number],
  );
}

export async function listDashboardIssues(
  role: UserRole,
  userId: string,
  department?: string | null,
) {
  await ensureAppReady();
  const hasUserId = typeof userId === "string" && userId.length > 0;

  if (role === "student") {
    if (!hasUserId) {
      return [];
    }

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
    if (!hasUserId) {
      return [];
    }

    return Issue.findAll({
      where: { assignedToId: userId },
      include: [{ model: User, as: "student", attributes: ["id", "name", "department"] }],
      order: [["updatedAt", "DESC"]],
    });
  }

  if (role === "supervisor") {
    if (!isTechnicalDepartment(department)) {
      return [];
    }

    const technicalDepartment = department as IssueCategory;

    return Issue.findAll({
      where: { category: technicalDepartment },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "department"] },
        { model: User, as: "assignee", attributes: ["id", "name", "department"] },
        { model: User, as: "supervisor", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
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
  studentId: string;
}) {
  await ensureAppReady();

  if (!issueCategories.includes(input.category)) {
    throw new Error("Unsupported issue category.");
  }

  const issue = await Issue.create({
    ...input,
    priority: "medium",
    status: "open",
  });

  const supervisors = await User.findAll({
    where: { role: "supervisor", department: getIssueDepartment(input.category) },
  });

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
  assignedBy: {
    id: string;
    role: UserRole;
    department: string | null;
  };
  priority: IssuePriority;
}) {
  await ensureAppReady();
  const [issue, technician] = await Promise.all([
    Issue.findByPk(input.issueId),
    User.findByPk(input.assignedToId),
  ]);

  if (!issue) {
    throw new Error("Issue not found.");
  }

  if (input.assignedBy.role !== "supervisor") {
    throw new Error("Only supervisors can assign tasks.");
  }

  const issueDepartment = getIssueDepartment(issue.category);

  if (input.assignedBy.department !== issueDepartment) {
    throw new Error("Supervisors can only assign tasks in their department.");
  }

  if (!technician || technician.role !== "technician") {
    throw new Error("Assigned user must be a technician.");
  }

  if (technician.department !== issueDepartment) {
    throw new Error("Technician department must match the task department.");
  }

  if (!issuePriorities.includes(input.priority)) {
    throw new Error("Unsupported issue priority.");
  }

  issue.assignedToId = input.assignedToId;
  issue.assignedById = input.assignedBy.id;
  issue.priority = input.priority;
  issue.status = issue.status === "open" ? "pending" : issue.status;
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
    title: `Issue pending: ${issue.reference}`,
    message: `${issue.title} has been assigned to a technician.`,
    type: "issue.pending",
  });

  return issue;
}

export async function updateIssueStatus(input: {
  issueId: string;
  status: IssueStatus;
  actor: {
    id: string;
    role: UserRole;
    department: string | null;
  };
  resolutionNotes?: string;
}) {
  await ensureAppReady();
  const issue = await Issue.findByPk(input.issueId);

  if (!issue) {
    throw new Error("Issue not found.");
  }

  const issueDepartment = getIssueDepartment(issue.category);

  if (input.actor.role === "technician") {
    if (issue.assignedToId !== input.actor.id) {
      throw new Error("Technicians can only update tasks assigned to them.");
    }
  } else if (input.actor.role === "supervisor") {
    if (input.actor.department !== issueDepartment) {
      throw new Error("Supervisors can only update tasks in their department.");
    }
  } else {
    throw new Error("Only supervisors and technicians can update tasks.");
  }

  issue.status = input.status;

  if (input.status === "resolved") {
    issue.resolutionNotes = input.resolutionNotes ?? "Resolved by technician.";
    issue.resolvedAt = new Date();
  } else {
    issue.resolvedAt = null;
  }

  await issue.save();

  await createNotification({
    userId: issue.studentId,
    title: `Issue updated: ${issue.reference}`,
    message: `${issue.title} is now marked as ${input.status.replaceAll("_", " ")}.`,
    type: "issue.status_changed",
    sendEmailCopy: input.status === "resolved",
  });

  if (issue.assignedById && issue.assignedById !== input.actor.id) {
    await createNotification({
      userId: issue.assignedById,
      title: `Progress update on ${issue.reference}`,
      message: `${issue.title} is now ${input.status.replaceAll("_", " ")}.`,
      type: "issue.status_changed",
    });
  }

  return issue;
}

export async function getTechnicians(department?: string | null) {
  await ensureAppReady();

  const where = department
    ? { role: "technician" as const, department }
    : { role: "technician" as const };

  return User.findAll({
    where,
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

export async function validateUserDepartment(role: UserRole, department: string) {
  if (!isTechnicalRole(role)) {
    return;
  }

  if (!isTechnicalDepartment(department)) {
    throw new Error("Technical users must belong to a valid maintenance department.");
  }
}