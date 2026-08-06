import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import {
  ErrorBanner,
  LoadingRow,
  EmptyState,
  StatusBadge,
  inputClasses,
  btnPrimary,
  btnSecondary,
  btnDanger,
  card,
} from "../components/ui";

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadTasks() {
    try {
      setTasks(await apiClient.get("/tasks"));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMembers() {
    try {
      setMembers(await apiClient.get("/users/members"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadTasks(), loadMembers()]);
      setLoading(false);
    })();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await apiClient.post("/tasks", { title, description });
      setTitle("");
      setDescription("");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <ErrorBanner message={error} />

      <section className={card}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
          Create task
        </h2>
        <form className="flex flex-wrap gap-3" onSubmit={handleCreate}>
          <input
            className={`${inputClasses} min-w-[180px] flex-1`}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className={`${inputClasses} min-w-[180px] flex-1`}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className={btnPrimary} type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create task"}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
          Tasks
        </h2>
        {loading ? (
          <LoadingRow label="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState>No tasks yet. Create the first one above.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskRow
                key={task.taskId}
                task={task}
                members={members}
                onAssign={handleAssign}
                onClose={handleClose}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function TaskRow({ task, members, onAssign, onClose }) {
  const assignedTo = task.assignedTo || [];
  const availableMembers = members.filter((m) => !assignedTo.includes(m.username));
  const [memberId, setMemberId] = useState("");

  useEffect(() => {
    if (memberId && !availableMembers.some((m) => m.username === memberId)) {
      setMemberId("");
    }
  }, [availableMembers, memberId]);

  return (
    <li className={card}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900 dark:text-neutral-50">{task.title}</div>
          {task.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{task.description}</p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-neutral-400">
        <span>Assigned:</span>
        {assignedTo.length === 0 ? (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
            Unassigned
          </span>
        ) : (
          assignedTo.map((id) => {
            const member = members.find((m) => m.username === id);
            return (
              <span
                key={id}
                className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
              >
                {member?.email || id}
              </span>
            );
          })
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-neutral-800">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!memberId) return;
            onAssign(task.taskId, memberId);
            setMemberId("");
          }}
        >
          <select
            className={`${inputClasses} min-w-[200px]`}
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          >
            <option value="" disabled>
              {availableMembers.length === 0 ? "No members available" : "Select a member..."}
            </option>
            {availableMembers.map((m) => (
              <option key={m.username} value={m.username}>
                {m.email}
                {m.enabled === false ? " (disabled)" : ""}
              </option>
            ))}
          </select>
          <button className={btnSecondary} type="submit" disabled={!memberId}>
            Assign
          </button>
        </form>
        {task.status !== "CLOSED" && (
          <button className={btnDanger} onClick={() => onClose(task.taskId)}>
            Close task
          </button>
        )}
      </div>
    </li>
  );
}
