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
      title: "Category pressure",
      text: "Track whether plumbing, electrical, window, or network complaints are accelerating and plan inventory around the spikes.",
    },
    {
      title: "Technician load",
      text: "See how many active tickets are sitting with each technician so supervisors can rebalance assignments before SLAs slip.",
    },
    {
      title: "Response quality",
      text: "Compare backlog, critical exposure, and average closure time to decide whether staffing or preventive maintenance needs attention.",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
      <header className="flex items-center justify-between rounded-full border border-stone-200 bg-white/90 px-5 py-3 shadow-sm shadow-stone-200/60 backdrop-blur">
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900">{appConfig.appName}</p>
          <p className="text-xs text-slate-500">Facilities issue response made simple</p>
        </div>
        <Link
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          href={session ? "/dashboard" : "/login"}
        >
          {session ? "Open dashboard" : "Login"}
        </Link>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm shadow-stone-200/60 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Campus maintenance web app
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            One simple place for students to report issues and for the maintenance team to resolve them.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Students raise issues like plumbing leaks, electrical faults, or broken windows. Supervisors assign work to technicians, technicians close jobs, and administrators watch the numbers that matter.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              href={session ? "/dashboard" : "/login"}
            >
              {session ? "Go to my dashboard" : "Login or register"}
            </Link>
            <Link
              className="rounded-full bg-stone-100 px-5 py-3 text-sm font-medium text-slate-700 ring-1 ring-stone-200 transition hover:bg-stone-200/70"
              href="/dashboard"
            >
              Preview workspace
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-slate-900 p-7 text-white shadow-sm shadow-slate-300/30">
          <p className="text-sm font-medium text-slate-300">Live campus snapshot</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                <p className="text-sm text-slate-300">{stat.label}</p>
                <strong className="mt-2 block text-3xl font-semibold tracking-tight">
                  {stat.value}
                </strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {decisionSignals.map((signal) => (
          <article
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60"
            key={signal.title}
          >
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{signal.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{signal.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
          <h3 className="text-lg font-semibold text-slate-900">Students</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Register, report issues, and track progress without technical clutter.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
          <h3 className="text-lg font-semibold text-slate-900">Supervisors</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Assign work fast, watch delays, and keep the maintenance team balanced.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
          <h3 className="text-lg font-semibold text-slate-900">Technicians</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Focus on assigned jobs, update status, and leave clear completion notes.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
          <h3 className="text-lg font-semibold text-slate-900">Administrators</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Monitor backlog, category pressure, and platform readiness for decisions.
          </p>
        </article>
      </section>
    </main>
  );
}
