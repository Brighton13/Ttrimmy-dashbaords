import { Panel, StatusPill } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { getUserDirectory } from "@/lib/services/issues";

export default async function UsersPage() {
  await requireRole(["admin"]);

  const users = await getUserDirectory();

  return (
    <Panel
      title="People and role coverage"
      description="A simple admin view of who reports, supervises, and executes maintenance work."
    >
      <div className="space-y-4">
        {users.map((user) => (
          <article className="rounded-3xl border border-stone-200 bg-stone-50 p-5" key={user.id}>
            <div>
              <strong className="text-base font-semibold text-slate-900">{user.name}</strong>
              <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill status={user.role} />
              <StatusPill status={user.department ?? "general"} />
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p>
                {user.role === "technician"
                  ? "Executes assigned issues"
                  : user.role === "supervisor"
                    ? "Assigns and monitors work"
                    : user.role === "admin"
                      ? "Reviews operational analytics"
                      : "Reports maintenance issues"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}