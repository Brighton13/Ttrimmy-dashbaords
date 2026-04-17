import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { NotificationCenter } from "@/components/notification-center";
import { requireSession, roleDescription } from "@/lib/auth/session";
import { dashboardNavByRole, roleHeroCopy } from "@/lib/navigation";
import { getUserNotifications } from "@/lib/notifications/service";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const notifications = await getUserNotifications(session.user.id);
  const nav = dashboardNavByRole[session.user.role];
  const hero = roleHeroCopy[session.user.role];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
      <header className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {hero.badge}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{hero.description}</p>
          </div>
          <div className="rounded-3xl bg-stone-50 px-5 py-4 ring-1 ring-stone-200">
            <p className="text-sm font-semibold text-slate-900">{session.user.name}</p>
            <p className="mt-1 text-sm text-slate-500">{roleDescription(session.user.role)}</p>
            <p className="mt-1 text-xs text-slate-400">{session.user.department ?? session.user.email}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <DashboardNav items={nav} />
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-stone-200 transition hover:bg-stone-200/70"
              href="/"
            >
              Landing page
            </Link>
            <form action={logoutAction}>
              <button
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                type="submit"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {children}
        <NotificationCenter
          realtimeToken={session.realtimeToken}
          initialNotifications={notifications.map((notification) => ({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            readAt: notification.readAt?.toISOString() ?? null,
            createdAt: notification.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}