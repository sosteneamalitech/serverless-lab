import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";

export default function AdminDashboard({ user, signOut }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await apiClient.post("/tasks", { title, description });
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAssign(taskId, memberId) {
    try {
      await apiClient.post(`/tasks/${taskId}/assign`, { memberId });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleClose(taskId) {
    try {
      await apiClient.post(`/tasks/${taskId}/close`, {});
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Signed in as {user?.signInDetails?.loginId}</p>
      <button onClick={signOut}>Sign out</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Create task</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Create</button>
      </form>

      <h2>Tasks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskRow key={task.taskId} task={task} onAssign={handleAssign} onClose={handleClose} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskRow({ task, onAssign, onClose }) {
  const [memberId, setMemberId] = useState("");

  return (
    <li>
      <strong>{task.title}</strong> — {task.status}
      <p>{task.description}</p>
      <p>Assigned: {(task.assignedTo || []).join(", ") || "none"}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!memberId) return;
          onAssign(task.taskId, memberId);
          setMemberId("");
        }}
      >
        <input
          placeholder="member@email"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
        />
        <button type="submit">Assign</button>
      </form>
      {task.status !== "CLOSED" && <button onClick={() => onClose(task.taskId)}>Close</button>}
    </li>
  );
}
