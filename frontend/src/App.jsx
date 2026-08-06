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
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-[#e5e5e5] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight text-[#3c3c3c]">🎯 Task Board</h1>
          <span className="inline-flex items-center rounded-full border-2 border-brand-500 bg-brand-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-brand-700">
            {isAdmin ? "Admin" : "Member"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-bold text-[#6b6b6b] sm:inline">
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
