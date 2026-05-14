import Link from "next/link";

import { getCurrentSession } from "@/lib/auth/session";
import { ensureAppReady } from "@/lib/core/bootstrap";
import { appConfig } from "@/lib/core/config";
import { getAnalyticsSnapshot } from "@/lib/services/analytics";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureAppReady();
  const [snapshot, session] = await Promise.all([
    getAnalyticsSnapshot(),
    getCurrentSession(),
  ]);

  const stats = [
    { label: "Reported issues", value: snapshot.totals.issues },
    { label: "Open backlog", value: snapshot.totals.backlog },
    { label: "Critical open", value: snapshot.totals.criticalOpen },
    {
      label: "Avg resolution",
      value: `${snapshot.totals.avgResolutionHours.toFixed(1)}h`,
    },
  ];

  const decisionSignals = [
    {
      title: "Department routing",
      text: "Requests move from student intake to the right departmental supervisor without emails, spreadsheets, or side chats.",
    },
    {
      title: "Technician execution",
      text: "Assigned technicians update active work directly in the system so progress and completion remain visible to everyone involved.",
    },
    {
      title: "Administrative control",
      text: "Admins create users, define responsibilities, and keep the operating model clean as departments and teams change.",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-4 py-5 sm:px-6 lg:px-8">
      <header className="surface-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-950">{appConfig.appName}</p>
          <p className="text-xs text-slate-500">Campus maintenance response workflow</p>
        </div>
        <div className="flex gap-3">
          <Link className="secondary-button" href="/login">
            Login
          </Link>
          <Link className="primary-button" href={session ? "/dashboard" : "/login"}>
            {session ? "Open dashboard" : "Enter workspace"}
          </Link>
        </div>
      </header>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel overflow-hidden p-7 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Facilities operations</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              A simple facility response system that looks and behaves like real operations software.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Students log issues, supervisors manage pending work by department, technicians execute assigned work, and administrators manage the user structure behind the process.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Intake</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Students submit requests with category, location, and a clear problem description.</p>
            </article>
            <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pending</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Supervisors assign priority and technician ownership inside their department.</p>
            </article>
            <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Closure</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Technicians and supervisors update status until the task is resolved and visible to the requester.</p>
            </article>
          </div>
        </div>

        <div className="rounded-[32px] bg-slate-950 p-7 text-white shadow-[0_30px_70px_rgba(15,23,42,0.26)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Live service snapshot</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{stat.label}</p>
                <strong className="mt-2 block text-3xl font-semibold tracking-tight">
                  {stat.value}
                </strong>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-slate-300">Designed for real roles</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Admin-managed accounts, departmental supervision, controlled task routing, and execution tracking that matches how facility teams actually work.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {decisionSignals.map((signal) => (
          <article
            className="surface-card p-6"
            key={signal.title}
          >
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">{signal.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{signal.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="surface-card p-6">
          <h3 className="text-lg font-semibold text-slate-950">Students</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Submit problems and see status changes without needing to understand internal workflows.
          </p>
        </article>
        <article className="surface-card p-6">
          <h3 className="text-lg font-semibold text-slate-950">Supervisors</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Set priority, assign work, and manage service flow inside their department.
          </p>
        </article>
        <article className="surface-card p-6">
          <h3 className="text-lg font-semibold text-slate-950">Technicians</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Execute assigned jobs and keep the execution board current with real progress.
          </p>
        </article>
        <article className="surface-card p-6">
          <h3 className="text-lg font-semibold text-slate-950">Administrators</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Manage accounts, roles, departments, and the operating view across the campus.
          </p>
        </article>
      </section>
    </main>
  );
}
