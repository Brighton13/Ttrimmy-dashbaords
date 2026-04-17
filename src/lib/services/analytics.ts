import { fn, col } from "sequelize";

import { ensureAppReady } from "@/lib/core/bootstrap";
import { Issue, User } from "@/lib/data/models";

type AggregateBucket = {
  category?: string;
  status?: string;
  priority?: string;
  total: number | string;
};

export async function getAnalyticsSnapshot() {
  await ensureAppReady();

  const [issues, users, rawByCategory, rawByStatus, rawByPriority] = await Promise.all([
    Issue.findAll(),
    User.findAll(),
    Issue.findAll({
      attributes: ["category", [fn("COUNT", col("category")), "total"]],
      group: ["category"],
      raw: true,
    }),
    Issue.findAll({
      attributes: ["status", [fn("COUNT", col("status")), "total"]],
      group: ["status"],
      raw: true,
    }),
    Issue.findAll({
      attributes: ["priority", [fn("COUNT", col("priority")), "total"]],
      group: ["priority"],
      raw: true,
    }),
  ]);

  const byCategory = rawByCategory as unknown as AggregateBucket[];
  const byStatus = rawByStatus as unknown as AggregateBucket[];
  const byPriority = rawByPriority as unknown as AggregateBucket[];

  const resolvedIssues = issues.filter((issue) => issue.status === "resolved");
  const avgResolutionHours = resolvedIssues.length
    ? resolvedIssues.reduce((total, issue) => {
        if (!issue.resolvedAt) {
          return total;
        }

        return total + (issue.resolvedAt.getTime() - issue.createdAt.getTime()) / 36e5;
      }, 0) / resolvedIssues.length
    : 0;

  const backlog = issues.filter((issue) => issue.status !== "resolved").length;
  const criticalOpen = issues.filter(
    (issue) => issue.priority === "critical" && issue.status !== "resolved",
  ).length;

  return {
    totals: {
      issues: issues.length,
      users: users.length,
      backlog,
      criticalOpen,
      avgResolutionHours,
    },
    issueLoadByCategory: byCategory,
    issueLoadByStatus: byStatus,
    issueLoadByPriority: byPriority,
  };
}