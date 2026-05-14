import { createUserAction, updateUserAction } from "@/app/actions/users";
import { ActionModal } from "@/components/action-modal";
import { PaginationLinks } from "@/components/pagination-links";
import { MetricCard, StatusPill } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { technicalDepartments, userRoles } from "@/lib/core/config";
import { getUserDirectory } from "@/lib/services/issues";

const USERS_PER_PAGE = 10;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireRole(["admin"]);

  const params = await searchParams;
  const search = (params.q ?? "").trim().toLowerCase();
  const users = await getUserDirectory();
  const filteredUsers = search
    ? users.filter((user) =>
        [user.name, user.email, user.role, user.department ?? ""]
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
    admins: users.filter((user) => user.role === "admin").length,
    students: users.filter((user) => user.role === "student").length,
    supervisors: users.filter((user) => user.role === "supervisor").length,
    technicians: users.filter((user) => user.role === "technician").length,
  };

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Users</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Manage user accounts, roles, and department ownership from one operational directory.
            </p>
          </div>
          <ActionModal
            description="Administrators create accounts and set role ownership before users access the workspace."
            title="Create user"
            triggerClassName="primary-button"
            triggerLabel="Add user"
          >
            <form action={createUserAction} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="modal-user-name">
                  Full name
                </label>
                <input className="field-input" id="modal-user-name" name="name" required type="text" />
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
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
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
          <MetricCard label="Supervisors" value={counts.supervisors} />
          <MetricCard label="Technicians" value={counts.technicians} />
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
            <input className="field-input" defaultValue={params.q ?? ""} name="q" placeholder="Search by name, email, role, or department..." type="search" />
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
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">
                    <StatusPill status={user.role} />
                  </td>
                  <td className="table-cell">
                    <StatusPill status={user.department ?? "general"} />
                  </td>
                  <td className="table-cell">
                    <ActionModal
                      description="Update role or department assignment for this user."
                      title={`Update ${user.name}`}
                      triggerLabel="Edit"
                    >
                      <form action={updateUserAction} className="grid gap-4">
                        <input name="userId" type="hidden" value={user.id} />
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`role-${user.id}`}>
                            Role
                          </label>
                          <select className="field-input" defaultValue={user.role} id={`role-${user.id}`} name="role">
                            {userRoles.map((role) => (
                              <option key={role} value={role}>
                                {role}
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
