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
    supervisor: [
      { label: "Backlog", value: snapshot.totals.backlog },
      { label: "Unassigned", value: unassignedIssues },
      { label: "Critical open", value: snapshot.totals.criticalOpen },
      { label: "Avg resolution", value: `${snapshot.totals.avgResolutionHours.toFixed(1)}h` },
    ],
    admin: [
      { label: "Total issues", value: snapshot.totals.issues },
      { label: "Backlog", value: snapshot.totals.backlog },
      { label: "Critical open", value: snapshot.totals.criticalOpen },
      { label: "Avg resolution", value: `${snapshot.totals.avgResolutionHours.toFixed(1)}h` },
    ],
  } as const;

  const highlightTitle =
    session.user.role === "student"
      ? "My recent reports"
      : session.user.role === "technician"
        ? "My active tasks"
        : session.user.role === "supervisor"
          ? "Queue requiring attention"
          : "Latest activity";

  return (
    <>
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Dashboard overview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              What matters right now
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A compact summary tailored to your role so you can act without digging through unnecessary options.
            </p>
          </div>
          <StatusPill status={session.user.role} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricsByRole[session.user.role].map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title={session.user.role === "admin" ? "Category load" : "Quick signals"}
          description="A short view of where maintenance demand is showing up right now."
        >
          <div className="space-y-4">
            {snapshot.issueLoadByCategory.map((item) => (
              <div key={String(item.category)}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-700">{String(item.category)}</span>
                  <strong className="text-slate-900">{String(item.total)}</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${Number(item.total) * 12 + 12}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title={highlightTitle}
          description="A small recent list so you can jump straight into the next decision or task."
        >
          <div className="space-y-3">
            {issues.slice(0, 5).map((issue) => (
              <article className="rounded-3xl border border-stone-200 bg-stone-50 p-4" key={issue.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <strong className="text-sm font-semibold text-slate-900">{issue.reference}</strong>
                    <p className="mt-1 text-sm text-slate-600">{issue.title}</p>
                  </div>
                  <StatusPill status={issue.status} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{issue.location}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}