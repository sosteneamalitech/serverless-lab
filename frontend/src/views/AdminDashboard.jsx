export default function AdminDashboard({ user, signOut }) {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Signed in as {user?.signInDetails?.loginId}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
