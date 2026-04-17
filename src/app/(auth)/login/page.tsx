import Link from "next/link";

import { loginAction, registerStudentAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

const demoAccounts = [
  ["Student", "student@ttrimmy.local"],
  ["Supervisor", "supervisor@ttrimmy.local"],
  ["Technician", "electrician@ttrimmy.local"],
  ["Admin", "admin@ttrimmy.local"],
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm shadow-stone-200/60 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Access</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Clean access for students and the maintenance team.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Students can register themselves. Supervisor, technician, and admin demo accounts are ready so you can test the workflow quickly.
        </p>
        <div className="mt-8 space-y-4">
          <div className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <p className="text-sm font-semibold text-amber-900">Demo password</p>
            <p className="mt-1 text-sm text-amber-800">Password123!</p>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Seeded role logins</h2>
            <div className="mt-4 space-y-3">
              {demoAccounts.map(([role, email]) => (
                <div className="flex items-center justify-between gap-3" key={email}>
                  <span className="text-sm font-medium text-slate-700">{role}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-stone-200">
                    {email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Link
          className="mt-8 inline-flex rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-stone-200 transition hover:bg-stone-200/70"
          href="/"
        >
          Back to overview
        </Link>
      </section>

      <div className="space-y-5">
        {params.error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <strong className="font-semibold">Form status</strong>
            <p className="mt-1">{params.error.replaceAll("_", " ")}</p>
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm shadow-stone-200/60">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Login</h2>
          <p className="mt-2 text-sm text-slate-500">
            Use any seeded account or a student account you have registered.
          </p>
          <form action={loginAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-email">
                Email
              </label>
              <input
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="login-email"
                name="email"
                type="email"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-password">
                Password
              </label>
              <input
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="login-password"
                name="password"
                type="password"
                required
              />
            </div>
            <button className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" type="submit">
              Enter dashboard
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm shadow-stone-200/60">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Student registration</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create an account and start reporting issues immediately.
          </p>
          <form action={registerStudentAction} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="student-name">
                Full name
              </label>
              <input
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="student-name"
                name="name"
                type="text"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="student-department">
                Residence or department
              </label>
              <input
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="student-department"
                name="department"
                type="text"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="student-email">
                Email
              </label>
              <input
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="student-email"
                name="email"
                type="email"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="student-password">
                Password
              </label>
              <input
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="student-password"
                name="password"
                type="password"
                required
              />
            </div>
            <button className="w-full rounded-full bg-teal-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-800 sm:col-span-2" type="submit">
              Register as student
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}