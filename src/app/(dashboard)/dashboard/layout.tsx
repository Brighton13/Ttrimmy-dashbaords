import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireSession, roleDescription } from "@/lib/auth/session";
import { dashboardNavByRole, roleHeroCopy } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const nav = dashboardNavByRole[session.user.role];
  const hero = roleHeroCopy[session.user.role];

  return (
    <main className="dashboard-shell">
      <aside className="flex min-h-screen flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-5">
          <Link className="flex items-start gap-3" href="/dashboard">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-sm font-semibold text-white">
              T
            </span>
            <span>
              <strong className="block text-sm font-semibold text-slate-950">Ttrimmy Facility</strong>
              <span className="block text-xs text-slate-500">Operations Portal</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 px-3 py-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <div className="mt-3">
            <DashboardNav items={nav} />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Current role</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{roleDescription(session.user.role)}</p>
            <p className="mt-1 text-sm text-slate-500">{session.user.department ?? "Campus wide"}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{hero.description}</p>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-200 px-4 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
              {session.user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950">{session.user.name}</p>
              <p className="truncate text-xs text-slate-500">{session.user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Link className="text-sm font-medium text-slate-500 transition hover:text-slate-900" href="/">
              Landing page
            </Link>
            <form action={logoutAction}>
              <button className="text-sm font-medium text-rose-600 transition hover:text-rose-700" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Dashboard</h1>
            <p className="text-sm text-slate-500">{hero.badge}</p>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="secondary-button h-10 w-10 px-0" type="button">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                <path d="M12 4a4 4 0 00-4 4v2.5c0 .8-.2 1.59-.57 2.3L6 15h12l-1.43-2.2a5 5 0 01-.57-2.3V8a4 4 0 00-4-4zM10 18a2 2 0 004 0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </button>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
              {session.user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          {children}
        </div>
      </section>
    </main>
  );
}