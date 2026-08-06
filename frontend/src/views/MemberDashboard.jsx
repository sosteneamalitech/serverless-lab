import { useEffect, useState } from "react";
import { apiClient } from "../api/apiClient";
import { ErrorBanner, LoadingRow, EmptyState, ProgressBar, selectClasses, card } from "../components/ui";

const MEMBER_STATUSES = ["OPEN", "IN_PROGRESS", "DONE"];

export default function MemberDashboard() {
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

  const doneCount = tasks.filter((t) => t.status === "DONE" || t.status === "CLOSED").length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <ErrorBanner message={error} />

      {!loading && tasks.length > 0 && (
        <section className={card}>
          <ProgressBar done={doneCount} total={tasks.length} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#6b6b6b]">My tasks</h2>
        {loading ? (
          <LoadingRow label="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState>No tasks assigned yet.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.taskId} className={card}>
                <div className="font-extrabold text-[#3c3c3c]">{task.title}</div>
                {task.description && <p className="mt-1 text-sm font-semibold text-[#6b6b6b]">{task.description}</p>}
                <select
                  className={`${selectClasses} mt-3 w-full sm:w-auto`}
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
      </section>
    </main>
  );
}
