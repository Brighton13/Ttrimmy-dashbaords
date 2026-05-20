import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; preview?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-[720px] rounded-[34px] bg-[#d8dceb] px-6 py-10 shadow-[0_24px_60px_rgba(30,41,59,0.12)] sm:px-10 sm:py-14">
        <div className="mx-auto max-w-[520px]">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Password recovery</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1a2342]">Reset your password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter the email address or generated login ID for the account. If it exists, a reset link will be sent.
            </p>
          </div>

          {params.sent ? (
            <section className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <strong className="font-semibold">Check for the reset link</strong>
              <p className="mt-1">If the account exists, a password reset link has been sent.</p>
              {params.preview ? (
                <p className="mt-3 break-all text-emerald-800">
                  Email delivery is not configured in this environment. Use this local reset link: <a className="font-medium underline" href={params.preview}>{params.preview}</a>
                </p>
              ) : null}
            </section>
          ) : null}

          {params.error ? (
            <section className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <strong className="font-semibold">Reset request failed</strong>
              <p className="mt-1">{params.error.replaceAll("_", " ")}</p>
            </section>
          ) : null}

          <section className="mt-6 rounded-[28px] bg-white px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:px-6 sm:py-7">
            <form action={requestPasswordResetAction} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="reset-identifier">
                  Email or login ID
                </label>
                <input
                  className="w-full rounded-xl border border-[#e2e8f6] bg-[#edf4ff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  id="reset-identifier"
                  name="identifier"
                  placeholder="name@example.com, STU-00001, or EMP-00001"
                  required
                  type="text"
                />
              </div>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f8dd8] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0b79bb]"
                type="submit"
              >
                Send reset link
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              <Link className="text-sky-700 transition hover:text-sky-800" href="/login">
                Back to sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}