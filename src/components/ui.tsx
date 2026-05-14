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
    <article className="surface-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <strong className="mt-4 block text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </strong>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p> : null}
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
    <section className="surface-panel p-6 sm:p-7">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "critical"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : status === "open"
          ? "border-sky-200 bg-sky-50 text-sky-700"
          : status === "in_progress"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone}`}>
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
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}