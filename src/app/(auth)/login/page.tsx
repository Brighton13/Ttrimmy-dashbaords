import { loginAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-[900px] rounded-[34px] bg-[#d8dceb] px-6 py-10 shadow-[0_24px_60px_rgba(30,41,59,0.12)] sm:px-10 sm:py-14">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="text-3xl font-black uppercase leading-[1.05] tracking-tight text-[#1a2342] sm:text-[2.65rem]">
            DYNAMIC MAINTENANCE 
            <br />
             TRACKING SYSTEM
            <br />
           FOR PUBLIC FACILITIES
          </p>
          <p className="mt-6 text-base font-medium italic text-[#3f4866] sm:text-lg">
            Analysing Resolution Rates and Backlog Management
            
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-[470px] flex-col gap-5">
        {params.error ? (
          <section className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <strong className="font-semibold">Sign-in status</strong>
            <p className="mt-1">{params.error.replaceAll("_", " ")}</p>
          </section>
        ) : null}

          <section className="rounded-[28px] bg-white px-5 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:px-6 sm:py-7">
            <div className="flex items-start justify-between gap-4">
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Account login</p>
                <h1 className="mt-3 text-[2rem] font-bold leading-none tracking-tight text-slate-900">
                  Enter your
                  <br />
                  credentials
                </h1>
                <p className="mt-3 max-w-[220px] text-sm leading-6 text-slate-500">
                  Use the account details created for you by the administrator.
                </p>
              </div>
              <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-center text-[11px] font-bold uppercase leading-tight tracking-[0.16em] text-slate-400">
                Role based
                <br />
                access
              </div>
            </div>

            <form action={loginAction} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-identifier">
                  Email
                </label>
                <input
                  className="w-full rounded-xl border border-[#e2e8f6] bg-[#edf4ff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  id="login-identifier"
                  name="identifier"
                  required
                  type="text"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-password">
                  Password
                </label>
                <input
                  className="w-full rounded-xl border border-[#e2e8f6] bg-[#edf4ff] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  id="login-password"
                  name="password"
                  required
                  type="password"
                />
              </div>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f8dd8] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0b79bb]"
                type="submit"
              >
                Log In
              </button>
              <p className="text-center text-sm font-medium text-slate-600">Forgot Password</p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}