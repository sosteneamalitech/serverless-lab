import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import {
  ErrorBanner,
  LoadingRow,
  EmptyState,
  StatusBadge,
  ProgressBar,
  inputClasses,
  selectClasses,
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

  const doneCount = tasks.filter((t) => t.status === "DONE" || t.status === "CLOSED").length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <ErrorBanner message={error} />

      {!loading && tasks.length > 0 && (
        <section className={card}>
          <ProgressBar done={doneCount} total={tasks.length} />
        </section>
      )}

      <section className={card}>
        <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-[#6b6b6b]">Create task</h2>
        <form className="flex flex-col gap-3" onSubmit={handleCreate}>
          <input
            className={inputClasses}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className={`${inputClasses} resize-none`}
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className={`${btnPrimary} self-start`} type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create task"}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#6b6b6b]">Tasks</h2>
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
          <div className="font-extrabold text-[#3c3c3c]">{task.title}</div>
          {task.description && <p className="mt-1 text-sm font-semibold text-[#6b6b6b]">{task.description}</p>}
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#6b6b6b]">
        <span>Assigned:</span>
        {assignedTo.length === 0 ? (
          <span className="inline-flex items-center rounded-full border-2 border-[#e5e5e5] bg-[#f7f7f7] px-2.5 py-0.5 text-xs font-bold text-[#6b6b6b]">
            Unassigned
          </span>
        ) : (
          assignedTo.map((id) => {
            const member = members.find((m) => m.username === id);
            return (
              <span
                key={id}
                className="inline-flex items-center rounded-full border-2 border-brand-500 bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700"
              >
                {member?.email || id}
              </span>
            );
          })
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#f0f0f0] pt-3">
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
            className={`${selectClasses} min-w-[200px]`}
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
