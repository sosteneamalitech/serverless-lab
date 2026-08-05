import "./auth/amplifyConfig";
import RequireAuth from "./auth/RequireAuth";
import { useUserGroups } from "./auth/useUserGroups";
import AdminDashboard from "./views/AdminDashboard";
import MemberDashboard from "./views/MemberDashboard";

function Dashboard({ user, signOut }) {
  const { groups, loading } = useUserGroups();

  if (loading) return <p>Loading...</p>;

  return groups.includes("Admin") ? (
    <AdminDashboard user={user} signOut={signOut} />
  ) : (
    <MemberDashboard user={user} signOut={signOut} />
  );
}

export default function App() {
  return <RequireAuth>{({ user, signOut }) => <Dashboard user={user} signOut={signOut} />}</RequireAuth>;
}
