import { MetricCard, Panel, StatusPill } from "@/components/ui";
import { requireSession } from "@/lib/auth/session";
import { getAnalyticsSnapshot } from "@/lib/services/analytics";
import { listDashboardIssues } from "@/lib/services/issues";

export default async function DashboardPage() {
  const session = await requireSession();
  const [snapshot, issues] = await Promise.all([
    getAnalyticsSnapshot(),
    listDashboardIssues(session.user.role, session.user.id),
  ]);

  const openIssues = issues.filter((issue) => issue.status !== "resolved").length;
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved").length;
  const unassignedIssues = issues.filter((issue) => !issue.assignedToId).length;
  const inProgressIssues = issues.filter((issue) => issue.status === "in_progress").length;

  const metricsByRole = {
    student: [
      { label: "Reported", value: issues.length },
      { label: "Open", value: openIssues },
      { label: "Resolved", value: resolvedIssues },
    ],
    technician: [
      { label: "Assigned", value: issues.length },
      { label: "In progress", value: inProgressIssues },
      { label: "Resolved", value: resolvedIssues },
    ],
    admin: [
      { label: "Backlog", value: snapshot.totals.backlog },
      { label: "Unassigned", value: unassignedIssues },
      { label: "Critical open", value: snapshot.totals.criticalOpen },
      { label: "Avg resolution", value: `${snapshot.totals.avgResolutionHours.toFixed(1)}h` },
    ],
  } as const;

  const highlightTitle =
    session.user.role === "student"
      ? "Recent requests"
      : session.user.role === "technician"
        ? "Assigned work"
        : "Issue queue";

  const focusByRole = {
    student: [
      { title: "Next action", detail: "Submit clear issue details and watch for assignment updates." },
      { title: "What you can track", detail: "Status, assigned technician, and completion notes on your own requests." },
    ],
    technician: [
      { title: "Next action", detail: "Move assigned jobs into progress as soon as work starts on site." },
      { title: "What matters", detail: "Keep notes current so admins know what is blocked and what is resolved." },
    ],
    admin: [
      { title: "Next action", detail: "Review unassigned items first, then route work to the right technicians across departments." },
      { title: "What matters", detail: "User ownership, priority, and backlog are your early warning signs for service risk." },
    ],
  } as const;

  return (
    <>
      <section className="surface-panel p-6 sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Overview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Operational summary</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              The dashboard changes by role so each user sees a realistic operating view instead of generic cards.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {focusByRole[session.user.role].map((item) => (
              <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4" key={item.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricsByRole[session.user.role].map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title={session.user.role === "admin" ? "Category load" : "Demand signals"}
          description="A quick read of where requests are concentrating right now."
        >
          <div className="space-y-4">
            {snapshot.issueLoadByCategory.map((item) => (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4" key={String(item.category)}>
                <div className="mb-3 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-700">{String(item.category)}</span>
                  <strong className="text-slate-900">{String(item.total)}</strong>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-950"
                    style={{ width: `${Number(item.total) * 12 + 12}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={highlightTitle}
          description="A live list of the items most relevant to the current user role."
        >
          <div className="space-y-3">
            {issues.slice(0, 5).map((issue) => (
              <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4" key={issue.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <strong className="text-sm font-semibold text-slate-950">{issue.reference}</strong>
                    <p className="mt-1 text-sm text-slate-700">{issue.title}</p>
                  </div>
                  <StatusPill status={issue.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill status={issue.priority} />
                  {session.user.role !== "student" ? <StatusPill status={issue.category} /> : null}
                </div>
                <p className="mt-3 text-sm text-slate-500">{issue.location}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}