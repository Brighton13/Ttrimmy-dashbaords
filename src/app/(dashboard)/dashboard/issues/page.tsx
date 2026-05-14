import { assignIssueAction, createIssueAction } from "@/app/actions/issues";
import { ActionModal } from "@/components/action-modal";
import { PaginationLinks } from "@/components/pagination-links";
import { EmptyState, Panel, StatusPill } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { issueCategories, issuePriorities } from "@/lib/core/config";
import { getTechnicians, listDashboardIssues } from "@/lib/services/issues";

const ISSUES_PER_PAGE = 10;

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireRole(["student", "supervisor"]);
  const params = await searchParams;
  const [issues, technicians] = await Promise.all([
    listDashboardIssues(session.user.role, session.user.id, session.user.department),
    session.user.role === "supervisor"
      ? getTechnicians(session.user.department)
      : Promise.resolve([]),
  ]);

  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(issues.length / ISSUES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ISSUES_PER_PAGE;
  const visibleIssues = issues.slice(startIndex, startIndex + ISSUES_PER_PAGE);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
            {session.user.role === "student" ? "Requests" : "Assignments"}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            {session.user.role === "student"
              ? "Track submitted maintenance requests and raise new issues through a separate request form."
              : "Review department intake and open assignment actions in separate modals from the list."}
          </p>
        </div>
        {session.user.role === "student" ? (
          <ActionModal
            description="Submit a new maintenance request. Priority is set when the department reviews and assigns it."
            title="Report issue"
            triggerClassName="primary-button"
            triggerLabel="New request"
          >
            <form action={createIssueAction} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-title">
                  Title
                </label>
                <input className="field-input" id="issue-title" name="title" required type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-category">
                  Category
                </label>
                <select className="field-input" id="issue-category" name="category" required>
                  {issueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-location">
                  Location
                </label>
                <input className="field-input" id="issue-location" name="location" required type="text" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issue-description">
                  Description
                </label>
                <textarea className="field-input min-h-32" id="issue-description" name="description" required />
              </div>
              <button className="primary-button sm:col-span-2" type="submit">
                Submit request
              </button>
            </form>
          </ActionModal>
        ) : null}
      </section>

      <Panel
        title="Issue board"
        description="All issue actions now open from buttons, while the list itself stays flat and paginated."
      >
        {issues.length === 0 ? (
          <EmptyState
            title="No issues visible"
            description="Create a new issue or wait for assignments to arrive."
          />
        ) : (
          <div className="table-shell -mx-6 overflow-hidden rounded-none border-x-0 border-b-0 sm:-mx-7">
            <div className="table-scroll">
              <table className="table-grid">
                <thead className="table-head">
                  <tr>
                    <th className="table-head-cell">Issue</th>
                    <th className="table-head-cell">Location</th>
                    <th className="table-head-cell">Status</th>
                    <th className="table-head-cell">Priority</th>
                    <th className="table-head-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleIssues.map((issue) => (
                    <tr className="table-row" key={issue.id}>
                      <td className="table-cell">
                        <div className="font-semibold text-slate-950">{issue.reference}</div>
                        <div className="mt-1 text-sm text-slate-700">{issue.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{issue.description}</div>
                      </td>
                      <td className="table-cell">{issue.location}</td>
                      <td className="table-cell">
                        <StatusPill status={issue.status} />
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-2">
                          <StatusPill status={issue.priority} />
                          <StatusPill status={issue.category} />
                        </div>
                      </td>
                      <td className="table-cell">
                        {session.user.role === "supervisor" ? (
                          <ActionModal
                            description="Assign a technician and confirm delivery priority for this request."
                            title={`Assign ${issue.reference}`}
                            triggerLabel="Assign"
                          >
                            <form action={assignIssueAction} className="grid gap-4">
                              <input name="issueId" type="hidden" value={issue.id} />
                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`assignee-${issue.id}`}>
                                  Technician
                                </label>
                                <select className="field-input" defaultValue={issue.assignedToId ?? ""} id={`assignee-${issue.id}`} name="assignedToId" required>
                                  <option disabled value="">
                                    Assign technician
                                  </option>
                                  {technicians.map((technician) => (
                                    <option key={technician.id} value={technician.id}>
                                      {technician.name} · {technician.department}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`priority-${issue.id}`}>
                                  Priority
                                </label>
                                <select className="field-input" defaultValue={issue.priority} id={`priority-${issue.id}`} name="priority" required>
                                  {issuePriorities.map((priority) => (
                                    <option key={priority} value={priority}>
                                      {priority}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button className="primary-button" type="submit">
                                Save assignment
                              </button>
                            </form>
                          </ActionModal>
                        ) : (
                          <span className="text-sm text-slate-600">{issue.assignee?.name ?? "Awaiting assignment"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-toolbar border-b-0 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                {startIndex + 1}-{Math.min(startIndex + ISSUES_PER_PAGE, issues.length)} of {issues.length} results
              </p>
              <PaginationLinks basePath="/dashboard/issues" currentPage={safePage} totalPages={totalPages} />
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
