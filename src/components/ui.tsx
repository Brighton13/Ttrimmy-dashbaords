import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/60">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <strong className="mt-3 block text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </strong>
      {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
    </article>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/60">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.replaceAll("_", " ");
  const tone =
    status === "resolved"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "critical" || status === "open"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${tone}`}>
      {normalized}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}