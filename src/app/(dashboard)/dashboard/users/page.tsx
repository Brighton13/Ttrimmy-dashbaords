import { createUserAction, deleteUserAction, updateUserAction } from "@/app/actions/users";
import { ActionModal } from "@/components/action-modal";
import { PaginationLinks } from "@/components/pagination-links";
import { MetricCard, StatusPill } from "@/components/ui";
import { getPreferredLoginIdentifier } from "@/lib/auth/session";
import { requireRole } from "@/lib/auth/session";
import { roleLabels, technicalDepartments, userRoles } from "@/lib/core/config";
import { getUserDirectory } from "@/lib/services/issues";

const USERS_PER_PAGE = 10;
const assignableRoles = userRoles.filter((role) => role !== "admin");

function splitName(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = trimmed.split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireRole(["supervisor"]);

  const params = await searchParams;
  const search = (params.q ?? "").trim().toLowerCase();
  const users = await getUserDirectory();
  const filteredUsers = search
    ? users.filter((user) =>
        [
          user.name,
          user.email,
          user.studentId ?? "",
          user.employeeId ?? "",
          user.role,
          user.department ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
    : users;

  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * USERS_PER_PAGE;
  const visibleUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  const counts = {
    admins: users.filter((user) => user.role === "supervisor").length,
    students: users.filter((user) => user.role === "student").length,
    technicians: users.filter((user) => user.role === "technician").length,
    total: users.length,
  };

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Users</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Manage user accounts, roles, department ownership, and the generated IDs used for sign-in.
            </p>
          </div>
          <ActionModal
            description="Admins create accounts and set role ownership before users access the workspace."
            title="Create user"
            triggerClassName="primary-button"
            triggerLabel="Add user"
          >
            <form action={createUserAction} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="modal-user-first-name">
                  First name
                </label>
                <input className="field-input" id="modal-user-first-name" name="firstName" required type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="modal-user-last-name">
                  Last name
                </label>
                <input className="field-input" id="modal-user-last-name" name="lastName" required type="text" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="modal-user-email">
                  Email
                </label>
                <input className="field-input" id="modal-user-email" name="email" required type="email" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="modal-user-role">
                  Role
                </label>
                <select className="field-input" defaultValue="student" id="modal-user-role" name="role">
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="modal-user-password">
                  Temporary password
                </label>
                <input className="field-input" id="modal-user-password" name="password" required type="password" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="modal-user-department">
                  Department or residence
                </label>
                <input className="field-input" id="modal-user-department" list="department-options" name="department" type="text" />
              </div>
              <button className="primary-button sm:col-span-2" type="submit">
                Create account
              </button>
            </form>
          </ActionModal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Admins" value={counts.admins} />
          <MetricCard label="Students" value={counts.students} />
          <MetricCard label="Technicians" value={counts.technicians} />
          <MetricCard label="Total users" value={counts.total} />
        </div>
      </section>

      <datalist id="department-options">
        {technicalDepartments.map((department) => (
          <option key={department} value={department} />
        ))}
      </datalist>

      <section className="table-shell">
        <div className="table-toolbar">
          <form action="/dashboard/users" className="w-full max-w-md">
            <input className="field-input" defaultValue={params.q ?? ""} name="q" placeholder="Search by name, email, login ID, role, or department..." type="search" />
          </form>
          <div className="text-sm text-slate-500">
            Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} results
          </div>
        </div>
        <div className="table-scroll">
          <table className="table-grid">
            <thead className="table-head">
              <tr>
                <th className="table-head-cell">Name</th>
                <th className="table-head-cell">Login ID</th>
                <th className="table-head-cell">Email</th>
                <th className="table-head-cell">Role</th>
                <th className="table-head-cell">Department</th>
                <th className="table-head-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr className="table-row" key={user.id}>
                  <td className="table-cell">
                    <div className="font-semibold text-slate-950">{user.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{user.id.slice(0, 8)}</div>
                  </td>
                  <td className="table-cell">
                    <div className="font-medium text-slate-900">{getPreferredLoginIdentifier(user)}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {user.role === "student" ? "Student ID" : "Employee ID"}
                    </div>
                  </td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">
                    <StatusPill status={user.role} />
                  </td>
                  <td className="table-cell">
                    <StatusPill status={user.department ?? "general"} />
                  </td>
                  <td className="table-cell">
                    {(() => {
                      const { firstName, lastName } = splitName(user.name);

                      return (
                        <div className="flex flex-wrap gap-2">
                    <ActionModal
                      description="Update the stored name, role, or department assignment for this user."
                      title={`Update ${user.name}`}
                      triggerLabel="Edit"
                    >
                      <form action={updateUserAction} className="grid gap-4">
                        <input name="userId" type="hidden" value={user.id} />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`first-name-${user.id}`}>
                              First name
                            </label>
                            <input className="field-input" defaultValue={firstName} id={`first-name-${user.id}`} name="firstName" required type="text" />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`last-name-${user.id}`}>
                              Last name
                            </label>
                            <input className="field-input" defaultValue={lastName} id={`last-name-${user.id}`} name="lastName" required type="text" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`role-${user.id}`}>
                            Role
                          </label>
                          <select className="field-input" defaultValue={user.role} id={`role-${user.id}`} name="role">
                            {(user.role === "admin" ? userRoles : assignableRoles).map((role) => (
                              <option key={role} value={role}>
                                {roleLabels[role]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`department-${user.id}`}>
                            Department or residence
                          </label>
                          <input className="field-input" defaultValue={user.department ?? ""} id={`department-${user.id}`} list="department-options" name="department" type="text" />
                        </div>
                        <button className="primary-button" type="submit">
                          Save changes
                        </button>
                      </form>
                    </ActionModal>
                    <ActionModal
                      description="Delete this account and clean up any linked records that depend on it."
                      title={`Delete ${user.name}`}
                      triggerLabel="Delete"
                    >
                      <form action={deleteUserAction} className="grid gap-4">
                        <input name="userId" type="hidden" value={user.id} />
                        <p className="text-sm leading-6 text-slate-600">
                          This removes the user, their notifications, their chat messages, and any requests they reported.
                        </p>
                        <button className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500" type="submit">
                          Confirm delete
                        </button>
                      </form>
                    </ActionModal>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-toolbar border-b-0 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            {filteredUsers.length === 0 ? "0" : `${startIndex + 1}-${Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length)}`} of {filteredUsers.length} results
          </p>
          <PaginationLinks basePath="/dashboard/users" currentPage={safePage} query={{ q: params.q }} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
