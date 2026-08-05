import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";

const MEMBER_STATUSES = ["OPEN", "IN_PROGRESS", "DONE"];

export default function MemberDashboard({ user, signOut }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    setLoading(true);
    try {
      setTasks(await apiClient.get("/tasks"));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(taskId, status) {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Member Dashboard</h1>
      <p>Signed in as {user?.signInDetails?.loginId}</p>
      <button onClick={signOut}>Sign out</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>My tasks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.taskId}>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <select
                value={task.status}
                disabled={task.status === "CLOSED"}
                onChange={(e) => handleStatusChange(task.taskId, e.target.value)}
              >
                {(task.status === "CLOSED" ? [...MEMBER_STATUSES, "CLOSED"] : MEMBER_STATUSES).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
