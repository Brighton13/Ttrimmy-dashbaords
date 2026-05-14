import { Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { appConfig } from "@/lib/core/config";

export default async function SettingsPage() {
  const session = await requireRole(["admin"]);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel
        title="Runtime channels"
        description="The platform services enabled for this deployment."
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Postgres</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-stone-200">sequelize</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Redis</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-stone-200">{appConfig.redisUrl ? "configured" : "local fallback"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Email</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-stone-200">
              {appConfig.smtpUrl || appConfig.smtpHost ? "smtp" : "stream transport"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Realtime</span>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-stone-200">websocket</span>
          </div>
        </div>
      </Panel>

      <Panel
        title="Current user"
        description="Your role determines what workflow controls appear in the dashboard."
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Name</span>
            <strong className="text-slate-900">{session.user.name}</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Role</span>
            <strong className="text-slate-900">{session.user.role}</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-600">Department</span>
            <strong className="text-slate-900">{session.user.department ?? "Not set"}</strong>
          </div>
        </div>
      </Panel>

      <Panel
        title="Operational guidance"
        description="Decision-making parameters exposed by the dashboard."
      >
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p>Backlog by status identifies whether pending work or execution capacity is constrained.</p>
          <p>Critical issue count shows immediate service risk and should drive escalation policy.</p>
          <p>Average resolution time shows whether technician staffing matches the issue mix.</p>
          <p>Category load helps plan preventive maintenance and inventory allocation.</p>
        </div>
      </Panel>
    </div>
  );
}