import { ensureAppReady } from "@/lib/core/bootstrap";
import type { Includeable, Order } from "sequelize";
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
import { Issue, IssueMessage, User } from "@/lib/data/models";
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

function buildIssueIncludes(): Includeable[] {
  const messageOrder: Order = [["createdAt", "ASC"]];

  return [
    { model: User, as: "student", attributes: ["id", "name", "department"] },
    { model: User, as: "assignee", attributes: ["id", "name", "department"] },
    { model: User, as: "admin", attributes: ["id", "name"] },
    {
      model: IssueMessage,
      as: "messages",
      separate: true,
      order: messageOrder,
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
    },
  ];
}

export async function listDashboardIssues(
  role: UserRole,
  userId: string,
) {
  await ensureAppReady();
  const hasUserId = typeof userId === "string" && userId.length > 0;

  if (role === "student") {
    if (!hasUserId) {
      return [];
    }

    return Issue.findAll({
      where: { studentId: userId },
      include: buildIssueIncludes(),
      order: [["createdAt", "DESC"]],
    });
  }

  if (role === "technician") {
    if (!hasUserId) {
      return [];
    }

    return Issue.findAll({
      where: { assignedToId: userId },
      include: buildIssueIncludes(),
      order: [["updatedAt", "DESC"]],
    });
  }

  if (role === "admin") {
    return Issue.findAll({
      include: buildIssueIncludes(),
      order: [["createdAt", "DESC"]],
    });
  }

  return Issue.findAll({
    include: buildIssueIncludes(),
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

  const admins = await User.findAll({ where: { role: "admin" } });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
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

  if (input.assignedBy.role !== "admin") {
    throw new Error("Only admins can assign tasks.");
  }

  const issueDepartment = getIssueDepartment(issue.category);

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

  if (input.actor.role === "technician") {
    if (issue.assignedToId !== input.actor.id) {
      throw new Error("Technicians can only update tasks assigned to them.");
    }
  } else if (input.actor.role === "admin") {
    // Admins can review and update any issue across departments.
  } else {
    throw new Error("Only admins and technicians can update tasks.");
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
    order: [["role", "ASC"], ["name", "ASC"]],
  });
}

export async function sendIssueMessage(input: {
  issueId: string;
  sender: {
    id: string;
    role: UserRole;
  };
  body: string;
}) {
  await ensureAppReady();

  const body = input.body.trim();

  if (!body) {
    throw new Error("Message body is required.");
  }

  const issue = await Issue.findByPk(input.issueId, {
    include: [
      { model: User, as: "student", attributes: ["id", "name"] },
      { model: User, as: "assignee", attributes: ["id", "name"] },
    ],
  });

  if (!issue) {
    throw new Error("Issue not found.");
  }

  if (!issue.assignedToId) {
    throw new Error("Chat is available after assignment.");
  }

  const isStudentParticipant = input.sender.role === "student" && issue.studentId === input.sender.id;
  const isTechnicianParticipant = input.sender.role === "technician" && issue.assignedToId === input.sender.id;

  if (!isStudentParticipant && !isTechnicianParticipant) {
    throw new Error("Only the assigned technician and reporting student can chat.");
  }

  const message = await IssueMessage.create({
    issueId: issue.id,
    senderId: input.sender.id,
    body,
  });

  const recipientId = isStudentParticipant ? issue.assignedToId : issue.studentId;
  const senderName = isStudentParticipant
    ? issue.student?.name ?? "Student"
    : issue.assignee?.name ?? "Technician";

  await createNotification({
    userId: recipientId,
    title: `New message on ${issue.reference}`,
    message: `${senderName}: ${body}`,
    type: "issue.message",
  });

  return message;
}

export async function validateUserDepartment(role: UserRole, department: string) {
  if (!isTechnicalRole(role)) {
    return;
  }

  if (!isTechnicalDepartment(department)) {
    throw new Error("Technical users must belong to a valid maintenance department.");
  }
}