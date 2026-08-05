export default function MemberDashboard({ user, signOut }) {
  return (
    <div>
      <h1>Member Dashboard</h1>
      <p>Signed in as {user?.signInDetails?.loginId}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
