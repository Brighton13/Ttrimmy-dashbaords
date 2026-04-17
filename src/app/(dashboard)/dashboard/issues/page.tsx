import { assignIssueAction, createIssueAction } from "@/app/actions/issues";
import { EmptyState, Panel, StatusPill } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { issueCategories, issuePriorities } from "@/lib/core/config";
import { listDashboardIssues, getTechnicians } from "@/lib/services/issues";

export default async function IssuesPage() {
  const session = await requireRole(["student", "supervisor", "admin"]);
  const [issues, technicians] = await Promise.all([
    listDashboardIssues(session.user.role, session.user.id),
    session.user.role === "supervisor" || session.user.role === "admin"
      ? getTechnicians()
      : Promise.resolve([]),
  ]);

  return (
    <>
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Issues</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {session.user.role === "student" ? "Report and track my issues" : "Assign incoming issues"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {session.user.role === "student"
              ? "Describe the problem clearly so the maintenance team can act immediately."
              : "Triage the queue and assign the right technician without leaving this screen."}
          </p>
        </div>
      </section>

      {session.user.role === "student" ? (
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Post a new issue</h2>
          <p className="mt-2 text-sm text-slate-500">
            Include the location and what is broken so the team can assign it correctly.
          </p>
          <form action={createIssueAction} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-title">
                Title
              </label>
              <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white" id="issue-title" name="title" required type="text" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-category">
                Category
              </label>
              <select className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white" id="issue-category" name="category" required>
                {issueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-priority">
                Priority
              </label>
              <select className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white" id="issue-priority" name="priority" required>
                {issuePriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-location">
                Location
              </label>
              <input className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white" id="issue-location" name="location" required type="text" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-description">
                Description
              </label>
              <textarea className="min-h-32 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white" id="issue-description" name="description" required />
            </div>
            <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:col-span-2" type="submit">
              Submit issue
            </button>
          </form>
        </section>
      ) : null}

      <Panel
        title="Issue board"
        description="A shared list of maintenance requests with owner, location, and current state."
      >
        {issues.length === 0 ? (
          <EmptyState
            title="No issues visible"
            description="Create a new issue or wait for assignments to arrive."
          />
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5" key={issue.id}>
                <div>
                  <strong className="text-base font-semibold text-slate-900">
                    {issue.reference} · {issue.title}
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{issue.description}</p>
                  <p className="mt-2 text-sm text-slate-500">{issue.location}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill status={issue.category} />
                  <StatusPill status={issue.priority} />
                  <StatusPill status={issue.status} />
                </div>
                <div className="mt-4">
                  {session.user.role === "supervisor" || session.user.role === "admin" ? (
                    <form action={assignIssueAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input name="issueId" type="hidden" value={issue.id} />
                      <select className="min-w-60 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400" defaultValue={issue.assignedToId ?? ""} name="assignedToId" required>
                        <option disabled value="">
                          Assign technician
                        </option>
                        {technicians.map((technician) => (
                          <option key={technician.id} value={technician.id}>
                            {technician.name} · {technician.department}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800" type="submit">
                        Assign
                      </button>
                    </form>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assigned to</p>
                      <p className="mt-1 text-sm text-slate-700">{issue.assignee?.name ?? "Awaiting assignment"}</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}