import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import TaskRow from "../components/TaskRow";
import { PRIORITIES } from "../constants";
import { uid, todayISO } from "../utils/date";

export default function TasksPage() {
  const { data, patch } = useApp();
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState("");

  const filtered = data.tasks.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.completed : t.completed
  );
  const doneCount = data.tasks.filter((t) => t.completed).length;

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    patch({
      tasks: [...data.tasks, {
        id: uid(), title, priority: newPriority, completed: false,
        dueDate: newDueDate || null, createdAt: todayISO(), subtasks: [],
      }],
    });
    setNewTitle("");
    setNewPriority("Medium");
    setNewDueDate("");
    setAdding(false);
  };

  return (
    <>
      <div className="exos-page-title">Tasks</div>
      <div className="exos-page-sub">
        {doneCount} of {data.tasks.length} completed · Click the star to set today's focus · Click ▸ to expand subtasks
      </div>
      <div className="exos-tab-row">
        {["all", "active", "completed"].map((f) => (
          <div key={f} className={"exos-tab" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </div>
        ))}
      </div>
      <div className="exos-card exos-card-pad">
        {filtered.map((t) => <TaskRow key={t.id} task={t} />)}
        {filtered.length === 0 && <div className="exos-empty-state">No tasks here.</div>}
        {adding ? (
          <div className="exos-add-inline">
            <input
              className="exos-input" autoFocus placeholder="Task title..." value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setAdding(false); }}
            />
            <select className="exos-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input
              className="exos-input" style={{ maxWidth: 150 }} type="date" value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
            <button className="exos-btn-primary" onClick={addTask}><Plus size={14} /> Add</button>
            <button className="exos-btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        ) : (
          <button className="exos-add-link" onClick={() => setAdding(true)}><Plus size={14} /> New Task</button>
        )}
      </div>
    </>
  );
}