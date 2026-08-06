export function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-100 border-t-brand-500 ${className}`}
    />
  );
}

export function LoadingRow({ label }) {
  return (
    <div className="flex items-center gap-2 py-3 text-sm font-semibold text-[#6b6b6b]">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl border-2 border-danger-500 bg-danger-100 px-4 py-2.5 text-sm font-bold text-danger-600">
      {message}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-[#e5e5e5] bg-white px-6 py-10 text-center">
      <span className="text-4xl" role="img" aria-label="owl mascot">
        🦉
      </span>
      <p className="text-sm font-bold text-[#6b6b6b]">{children}</p>
    </div>
  );
}

const STATUS_STYLES = {
  OPEN: "border-warn-500 bg-warn-100 text-warn-600",
  IN_PROGRESS: "border-info-500 bg-info-100 text-info-600",
  DONE: "border-brand-500 bg-brand-100 text-brand-700",
  CLOSED: "border-brand-500 bg-brand-100 text-brand-700",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "border-[#e5e5e5] bg-[#f7f7f7] text-[#6b6b6b]";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border-2 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${style}`}
    >
      {status}
    </span>
  );
}

export function ProgressBar({ done, total }) {
  const safeTotal = total || 0;
  const pct = safeTotal === 0 ? 0 : Math.round((done / safeTotal) * 100);
  const allDone = safeTotal > 0 && done === safeTotal;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-5 w-full overflow-hidden rounded-full border-2 border-[#e5e5e5] bg-[#f0f0f0]">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-extrabold text-[#6b6b6b]">
        {safeTotal === 0 ? "No tasks yet" : `${done}/${safeTotal} tasks completed${allDone ? " 🎉" : ""}`}
      </span>
    </div>
  );
}

export const inputClasses =
  "rounded-2xl border-2 border-[#e5e5e5] bg-white px-3 py-2 text-sm font-semibold text-[#3c3c3c] placeholder:font-normal placeholder:text-[#afafaf] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export const selectClasses =
  "appearance-none rounded-2xl border-2 border-[#e5e5e5] bg-white bg-no-repeat px-3 py-2 pr-9 text-sm font-semibold text-[#3c3c3c] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50 [background-image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20stroke%3D%22%234b4b4b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] [background-position:right_0.75rem_center]";

const btnBase =
  "inline-flex items-center justify-center rounded-2xl border-b-4 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0";

export const btnPrimary = `${btnBase} border-brand-600 bg-brand-500 text-white hover:bg-brand-400`;

export const btnSecondary = `${btnBase} border-[#e5e5e5] bg-white text-[#4b4b4b] hover:bg-[#f7f7f7]`;

export const btnDanger = `${btnBase} border-danger-600 bg-danger-500 text-white hover:bg-danger-500/90`;

export const card = "rounded-3xl border-2 border-[#e5e5e5] bg-white p-5 shadow-[0_2px_0_#e5e5e5]";
