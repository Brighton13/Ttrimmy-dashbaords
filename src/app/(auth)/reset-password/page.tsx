import Link from "next/link";

import { resetPasswordAction } from "@/app/actions/auth";
import { getUserForPasswordResetToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const user = token ? await getUserForPasswordResetToken(token) : null;
  const hasValidToken = token.length > 0 && Boolean(user);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-[720px] rounded-[34px] bg-[#d8dceb] px-6 py-10 shadow-[0_24px_60px_rgba(30,41,59,0.12)] sm:px-10 sm:py-14">
        <div className="mx-auto max-w-[520px]">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Secure reset</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1a2342]">Choose a new password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Reset links expire after 30 minutes and stop working immediately after the password is changed.
            </p>
          </div>

          {!hasValidToken ? (
            <section className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <strong className="font-semibold">Reset link unavailable</strong>
              <p className="mt-1">{(params.error ?? "invalid_or_expired_link").replaceAll("_", " ")}</p>
              <p className="mt-3">
                <Link className="font-medium underline" href="/forgot-password">
                  Request a new password reset link
                </Link>
              </p>
            </section>
          ) : null}

          {hasValidToken ? (
            <section className="mt-6 rounded-[28px] bg-white px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:px-6 sm:py-7">
              <div className="mb-5 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Resetting password for <strong className="text-slate-900">{user?.email}</strong>
              </div>
              {params.error ? (
                <section className="mb-5 rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <strong className="font-semibold">Reset failed</strong>
                  <p className="mt-1">{params.error.replaceAll("_", " ")}</p>
                </section>
              ) : null}
              <form action={resetPasswordAction} className="space-y-5">
                <input name="token" type="hidden" value={token} />
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="new-password">
                    New password
                  </label>
                  <input
                    className="w-full rounded-xl border border-[#e2e8f6] bg-[#edf4ff] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                    id="new-password"
                    minLength={8}
                    name="password"
                    required
                    type="password"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <input
                    className="w-full rounded-xl border border-[#e2e8f6] bg-[#edf4ff] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                    id="confirm-password"
                    minLength={8}
                    name="confirmPassword"
                    required
                    type="password"
                  />
                </div>
                <button
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f8dd8] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0b79bb]"
                  type="submit"
                >
                  Update password
                </button>
              </form>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}