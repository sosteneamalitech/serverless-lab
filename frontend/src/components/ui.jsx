export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600 dark:border-neutral-700 dark:border-t-violet-400 ${className}`}
    />
  );
}

export function LoadingRow({ label }) {
  return (
    <div className="flex items-center gap-2 py-3 text-sm text-slate-500 dark:text-neutral-400">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
      {message}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
      {children}
    </div>
  );
}

const STATUS_STYLES = {
  OPEN: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  IN_PROGRESS: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  DONE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  CLOSED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300";
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style}`}>
      {status}
    </span>
  );
}

export const inputClasses =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-violet-900/40";

export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";

export const btnDanger =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-red-950/40";

export const card =
  "rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900";
