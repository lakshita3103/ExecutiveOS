import React, { useState } from "react";
import { Check, Star, Edit3, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PRIORITIES } from "../constants";

/**
 * Shared between the Dashboard's "Tasks" preview card and the full Tasks
 * page. Both render this same row against the same shared `data.tasks`, so
 * toggling completion or re-prioritizing here updates everywhere at once —
 * including the Dashboard's "Today's Focus" completion percentage.
 */
export default function TaskRow({ task, compact }) {
  const { data, patch } = useApp();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(task.title);

  const toggle = () =>
    patch({ tasks: data.tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)) });

  const remove = () =>
    patch({
      tasks: data.tasks.filter((t) => t.id !== task.id),
      focusTaskId: data.focusTaskId === task.id ? null : data.focusTaskId,
    });

  const setFocus = () => patch({ focusTaskId: data.focusTaskId === task.id ? null : task.id });

  const cyclePriority = () => {
    const idx = PRIORITIES.indexOf(task.priority);
    const next = PRIORITIES[(idx + 1) % PRIORITIES.length];
    patch({ tasks: data.tasks.map((t) => (t.id === task.id ? { ...t, priority: next } : t)) });
  };

  const saveTitle = () => {
    const v = val.trim();
    patch({ tasks: data.tasks.map((t) => (t.id === task.id ? { ...t, title: v || t.title } : t)) });
    setEditing(false);
  };

  return (
    <div className="exos-list-row">
      <button className={"exos-checkbox" + (task.completed ? " checked" : "")} onClick={toggle}>
        {task.completed && <Check size={12} strokeWidth={3} />}
      </button>
      {editing ? (
        <input
          className="exos-input"
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveTitle();
            if (e.key === "Escape") { setVal(task.title); setEditing(false); }
          }}
        />
      ) : (
        <span
          className={"exos-task-title" + (task.completed ? " done" : "")}
          onClick={() => !compact && setEditing(true)}
        >
          {task.title}
        </span>
      )}
      <span
        className={"exos-badge " + task.priority}
        style={!compact ? { cursor: "pointer" } : undefined}
        onClick={!compact ? cyclePriority : undefined}
      >
        {task.priority}
      </span>
      {!compact && (
        <div className="exos-row-actions">
          <button
            className={"exos-mini-btn star" + (data.focusTaskId === task.id ? " active" : "")}
            onClick={setFocus}
            title="Set as today's focus"
          >
            <Star size={14} />
          </button>
          <button className="exos-mini-btn" onClick={() => setEditing(true)} title="Edit">
            <Edit3 size={14} />
          </button>
          <button className="exos-mini-btn danger" onClick={remove} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
