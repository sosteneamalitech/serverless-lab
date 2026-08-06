import "./auth/amplifyConfig";
import RequireAuth from "./auth/RequireAuth";
import { useUserGroups } from "./auth/useUserGroups";
import AdminDashboard from "./views/AdminDashboard";
import MemberDashboard from "./views/MemberDashboard";
import { LoadingRow, btnSecondary } from "./components/ui";

function Dashboard({ user, signOut }) {
  const { groups, loading } = useUserGroups();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingRow label="Loading your workspace..." />
      </div>
    );
  }

  const isAdmin = groups.includes("Admin");

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-neutral-50">
            Task Board
          </h1>
          <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
            {isAdmin ? "Admin" : "Member"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline dark:text-neutral-400">
            {user?.signInDetails?.loginId}
          </span>
          <button className={btnSecondary} onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      {isAdmin ? (
        <AdminDashboard user={user} signOut={signOut} />
      ) : (
        <MemberDashboard user={user} signOut={signOut} />
      )}
    </div>
  );
}

export default function App() {
  return <RequireAuth>{({ user, signOut }) => <Dashboard user={user} signOut={signOut} />}</RequireAuth>;
}
