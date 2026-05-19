import bcrypt from "bcryptjs";

import { sequelize } from "@/lib/core/db";
import {
  ensureUserIdentifiers,
  Notification,
  User,
  Issue,
  initializeModels,
} from "@/lib/data/models";
import { startNotificationSubscription } from "@/lib/notifications/redis";

declare global {
  var __ttrimmyBootstrapPromise: Promise<void> | undefined;
}

async function backfillUserIdentifiers() {
  const users = await User.findAll({ order: [["createdAt", "ASC"], ["id", "ASC"]] });

  for (const user of users) {
    if (user.role === "student" && user.studentId) {
      continue;
    }

    if (user.role !== "student" && user.employeeId) {
      continue;
    }

    await ensureUserIdentifiers(user);
    await user.save({ fields: ["studentId", "employeeId"] });
  }
}

async function seedIfEmpty() {
  const existingUsers = await User.count();

  if (existingUsers > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const supervisor = await User.create({
    name: "Campus Admin",
    email: "admin@ttrimmy.local",
    role: "supervisor",
    passwordHash,
    department: "Electrical",
  });
  const student = await User.create({
    name: "Amina Student",
    email: "student@ttrimmy.local",
    role: "student",
    passwordHash,
    department: "Engineering Hostel",
  });
  const electrician = await User.create({
    name: "Joel Electrician",
    email: "electrician@ttrimmy.local",
    role: "technician",
    passwordHash,
    department: "Electrical",
  });
  const plumber = await User.create({
    name: "Maria Plumber",
    email: "plumber@ttrimmy.local",
    role: "technician",
    passwordHash,
    department: "Plumbing",
  });

  const issue = await Issue.create({
    title: "Broken corridor light",
    description:
      "The third-floor corridor light in Block C has been flickering for two days and is now off completely.",
    category: "Electrical",
    location: "Block C, Floor 3",
    priority: "high",
    status: "in_progress",
    studentId: student.id,
    assignedToId: electrician.id,
    assignedById: supervisor.id,
  });

  await Notification.bulkCreate([
    {
      userId: supervisor.id,
      title: "New sample issue seeded",
      message: `Issue ${issue.reference} is pending department assignment.`,
      type: "issue.created",
    },
    {
      userId: electrician.id,
      title: "Task assigned",
      message: `You have been assigned ${issue.reference}.`,
      type: "issue.assigned",
    },
    {
      userId: supervisor.id,
      title: "Demo workspace ready",
      message: "Seed data has been provisioned for all roles.",
      type: "system.seeded",
    },
  ]);

  await Issue.create({
    title: "Leaking bathroom pipe",
    description: "Water is leaking under sink 14B in the west wing bathrooms.",
    category: "Plumbing",
    location: "West Wing Bathroom 14B",
    priority: "critical",
    status: "open",
    studentId: student.id,
  });

  await Issue.create({
    title: "Cracked window pane",
    description: "A cracked pane in Lecture Hall 2 is causing a draft during classes.",
    category: "Windows",
    location: "Lecture Hall 2",
    priority: "medium",
    status: "pending",
    studentId: student.id,
    assignedById: supervisor.id,
    assignedToId: plumber.id,
  });
}

async function bootstrap() {
  initializeModels();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  await backfillUserIdentifiers();
  await seedIfEmpty();
  await startNotificationSubscription();
}

export async function ensureAppReady() {
  initializeModels();
  globalThis.__ttrimmyBootstrapPromise ??= bootstrap();
  await globalThis.__ttrimmyBootstrapPromise;
}