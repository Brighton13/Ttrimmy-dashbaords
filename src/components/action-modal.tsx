"use client";

import type { ReactNode } from "react";
import { useId, useRef } from "react";

export function ActionModal({
  title,
  description,
  triggerLabel,
  triggerClassName = "secondary-button",
  children,
}: {
  title: string;
  description?: string;
  triggerLabel: string;
  triggerClassName?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button className={triggerClassName} onClick={() => dialogRef.current?.showModal()} type="button">
        {triggerLabel}
      </button>
      <dialog
        aria-labelledby={titleId}
        className="backdrop:bg-slate-950/40 w-full max-w-2xl rounded-[18px] border border-slate-200 p-0 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
        ref={dialogRef}
      >
        <div className="bg-white p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-950" id={titleId}>
                {title}
              </h3>
              {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
            </div>
            <button
              aria-label="Close modal"
              className="secondary-button h-10 w-10 px-0"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
          <div className="pt-5">{children}</div>
        </div>
      </dialog>
    </>
  );
}