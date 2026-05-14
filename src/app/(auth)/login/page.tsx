import Link from "next/link";

import { loginAction } from "@/app/actions/auth";

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
    <main className="mx-auto grid min-h-screen w-full max-w-[1280px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <section className="surface-panel overflow-hidden bg-slate-950 p-8 text-white sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Secure access</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Sign in to the facility response workspace.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
          Every account is created by an administrator so user roles, departments, and workflow permissions stay controlled from day one.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Demo password</p>
            <p className="mt-2 text-lg font-semibold">Password123!</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Access model</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Students submit issues. Supervisors assign by department. Technicians execute tasks. Admins manage users and oversight.</p>
          </div>
        </div>
        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Seeded role logins</h2>
          <div className="mt-4 space-y-3">
            {demoAccounts.map(([role, email]) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3" key={email}>
                <span className="text-sm font-medium text-slate-200">{role}</span>
                <span className="text-sm text-slate-400">{email}</span>
              </div>
            ))}
          </div>
        </div>
        <Link className="mt-8 inline-flex text-sm font-medium text-cyan-300 transition hover:text-cyan-200" href="/">
          Return to landing page
        </Link>
      </section>

      <div className="flex flex-col gap-5">
        {params.error ? (
          <section className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <strong className="font-semibold">Sign-in status</strong>
            <p className="mt-1">{params.error.replaceAll("_", " ")}</p>
          </section>
        ) : null}

        <section className="surface-panel p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Account login</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Enter your credentials</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use the account details created for you by the administrator.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Role based access
            </div>
          </div>
          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-email">
                Email
              </label>
              <input className="field-input" id="login-email" name="email" type="email" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-password">
                Password
              </label>
              <input className="field-input" id="login-password" name="password" type="password" required />
            </div>
            <button className="primary-button w-full" type="submit">
              Enter dashboard
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}