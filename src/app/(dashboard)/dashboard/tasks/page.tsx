import { updateIssueStatusAction } from "@/app/actions/issues";
import { EmptyState, Panel, StatusPill } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { listDashboardIssues } from "@/lib/services/issues";

export default async function TasksPage() {
  const session = await requireRole(["technician", "supervisor", "admin"]);
  const issues = await listDashboardIssues(session.user.role, session.user.id);

  const actionableIssues = issues.filter((issue) => issue.assignedToId || session.user.role !== "technician");

  return (
    <Panel
      title="Execution queue"
      description="Technicians update work state while supervisors and admins monitor delivery quality."
    >
      {actionableIssues.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Assignments will appear here once the supervisor routes work to you."
        />
      ) : (
        <div className="space-y-4">
          {actionableIssues.map((issue) => (
            <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5" key={issue.id}>
              <div>
                <strong className="text-base font-semibold text-slate-900">{issue.title}</strong>
                <p className="mt-1 text-sm text-slate-600">{issue.location}</p>
                <p className="mt-1 text-sm text-slate-500">{issue.reference}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill status={issue.status} />
                <StatusPill status={issue.priority} />
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reporter</p>
                <p className="mt-1 text-sm text-slate-700">{issue.student?.name ?? "Campus student"}</p>
              </div>
              <div className="mt-4">
                {session.user.role === "technician" ? (
                  <form action={updateIssueStatusAction} className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-start">
                    <input name="issueId" type="hidden" value={issue.id} />
                    <select className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" defaultValue={issue.status} name="status">
                      <option value="triaged">Triaged</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <textarea
                      className="min-h-24 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                      name="resolutionNotes"
                      placeholder="Add diagnostic notes or resolution details"
                    />
                    <button className="rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800" type="submit">
                      Update task
                    </button>
                  </form>
                ) : (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assignee</p>
                    <p className="mt-1 text-sm text-slate-700">{issue.assignee?.name ?? "Unassigned"}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}