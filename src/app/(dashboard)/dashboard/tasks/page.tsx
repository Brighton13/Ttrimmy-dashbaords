import { updateIssueStatusAction } from "@/app/actions/issues";
import { ActionModal } from "@/components/action-modal";
import { PaginationLinks } from "@/components/pagination-links";
import { EmptyState, Panel, StatusPill } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { listDashboardIssues } from "@/lib/services/issues";

const TASKS_PER_PAGE = 10;

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireRole(["technician", "supervisor"]);
  const params = await searchParams;
  const issues = await listDashboardIssues(
    session.user.role,
    session.user.id,
    session.user.department,
  );

  const actionableIssues = issues.filter((issue) => issue.assignedToId || session.user.role !== "technician");
  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(actionableIssues.length / TASKS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * TASKS_PER_PAGE;
  const visibleIssues = actionableIssues.slice(startIndex, startIndex + TASKS_PER_PAGE);

  return (
    <Panel
      title="Execution queue"
      description="Assigned work is maintained in a paginated operational list, and all update forms open from separate modals."
    >
      {actionableIssues.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Assignments will appear here once the supervisor routes work to you."
        />
      ) : (
        <div className="table-shell -mx-6 overflow-hidden rounded-none border-x-0 border-b-0 sm:-mx-7">
          <div className="table-scroll">
            <table className="table-grid">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Task</th>
                  <th className="table-head-cell">Reporter</th>
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
                      <div className="mt-1 text-xs text-slate-500">{issue.location}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-slate-800">{issue.student?.name ?? "Campus student"}</div>
                      <div className="mt-1 text-xs text-slate-500">{issue.student?.department ?? "Campus"}</div>
                    </td>
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
                      <ActionModal
                        description="Update execution status and capture any diagnostic or completion notes."
                        title={`Update ${issue.reference}`}
                        triggerLabel="Update"
                      >
                        <form action={updateIssueStatusAction} className="grid gap-4">
                          <input name="issueId" type="hidden" value={issue.id} />
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`status-${issue.id}`}>
                              Status
                            </label>
                            <select className="field-input" defaultValue={issue.status} id={`status-${issue.id}`} name="status">
                              <option value="open">Open</option>
                              <option value="pending">Pending</option>
                              <option value="in_progress">In progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`notes-${issue.id}`}>
                              Notes
                            </label>
                            <textarea className="field-input min-h-28" id={`notes-${issue.id}`} name="resolutionNotes" placeholder="Add diagnostic notes, blockers, or completion details" />
                          </div>
                          <button className="primary-button" type="submit">
                            Save update
                          </button>
                        </form>
                      </ActionModal>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-toolbar border-b-0 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              {startIndex + 1}-{Math.min(startIndex + TASKS_PER_PAGE, actionableIssues.length)} of {actionableIssues.length} results
            </p>
            <PaginationLinks basePath="/dashboard/tasks" currentPage={safePage} totalPages={totalPages} />
          </div>
        </div>
      )}
    </Panel>
  );
}
