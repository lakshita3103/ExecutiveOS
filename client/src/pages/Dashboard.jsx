import React, { useMemo } from "react";
import {
  Calendar as CalendarIcon, FolderOpen, CheckSquare, Sparkles, FileText, Wallet,
  Target, ArrowRight, ChevronRight, MapPin, Plus,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import TaskRow from "../components/TaskRow";
import Donut from "../components/Donut";
import { CATEGORY_LIST, CATEGORY_COLORS } from "../constants";
import {
  todayISO, formatNiceDate, greetingWord, minutesUntilEvent, formatDuration, daysSince,
} from "../utils/date";
import { IconForDoc, colorForDoc } from "../utils/docIcons";

export default function Dashboard({ goto }) {
  const { data } = useApp();
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter((t) => t.completed).length;
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const focusTask =
    data.tasks.find((t) => t.id === data.focusTaskId) ||
    data.tasks.find((t) => !t.completed && t.priority === "High") ||
    data.tasks.find((t) => !t.completed) ||
    data.tasks[0];

  const today = todayISO();
  const todayEvents = data.events.filter((e) => e.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = data.events
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 2);
  const pendingTasks = data.tasks.filter((t) => !t.completed);
  const recentDocs = [...data.documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const totalSpend = data.transactions.reduce((s, t) => s + t.amount, 0);
  const byCategory = CATEGORY_LIST
    .map((c) => ({
      label: c,
      color: CATEGORY_COLORS[c],
      value: data.transactions.filter((t) => t.category === c).reduce((s, t) => s + t.amount, 0),
    }))
    .filter((c) => c.value > 0);

  const daySummary = useMemo(() => {
    const taskPart = `${pendingTasks.length} ${pendingTasks.length === 1 ? "task" : "tasks"} left`;
    let meetingPart;
    if (todayEvents.length === 0) meetingPart = "no meetings today";
    else if (todayEvents.length === 1) meetingPart = `1 meeting at ${todayEvents[0].time}`;
    else meetingPart = `${todayEvents.length} meetings today`;
    return `You have ${taskPart} and ${meetingPart}.`;
  }, [pendingTasks.length, todayEvents]);

  const suggestions = useMemo(() => {
    const list = [];

    const highTask = data.tasks.find((t) => !t.completed && t.priority === "High");
    if (highTask) {
      list.push({
        emoji: "🔴", bg: "var(--danger-soft)",
        text: <>Finish <b>{highTask.title}</b> first — it's your highest priority.</>,
      });
    }

    const nextToday = todayEvents
      .map((e) => ({ e, mins: minutesUntilEvent(e.date, e.time) }))
      .filter((x) => x.mins !== null && x.mins >= 0)
      .sort((a, b) => a.mins - b.mins)[0];
    if (nextToday) {
      list.push({
        emoji: "📅", bg: "var(--accent-soft)",
        text: <>You have <b>{nextToday.e.title}</b> in {formatDuration(nextToday.mins)}.</>,
      });
    }

    const stale = data.tasks
      .filter((t) => !t.completed && t.createdAt)
      .map((t) => ({ t, days: daysSince(t.createdAt) }))
      .filter((x) => x.days >= 3)
      .sort((a, b) => b.days - a.days)[0];
    if (stale) {
      list.push({
        emoji: "📝", bg: "var(--warning-soft)",
        text: <><b>{stale.t.title}</b> hasn't been touched in {stale.days} days.</>,
      });
    }

    if (totalTasks) {
      list.push({
        emoji: "✅", bg: "var(--success-soft)",
        text: pct === 100
          ? <>You're all caught up on today's tasks!</>
          : <>You're <b>{pct}%</b> through today's tasks.</>,
      });
    }

    return list.slice(0, 4);
  }, [data, todayEvents, totalTasks, pct]);

  return (
    <>
      <div className="exos-greeting">Good {greetingWord()}, <span>{data.user.name}</span> 👋</div>
      <div className="exos-subgreeting">
        {daySummary} Your highest priority is <b>{focusTask?.title || "nothing yet — add a task"}</b>.
      </div>

      {focusTask && (
        <div className="exos-focus-card">
          <div className="exos-focus-eyebrow"><Target size={14} /> TODAY'S FOCUS</div>
          <div className="exos-focus-title">{focusTask.title}</div>
          <div className="exos-focus-meta">
            {focusTask.subtasks?.length
              ? `${focusTask.subtasks.filter((s) => s.done).length} of ${focusTask.subtasks.length} subtasks completed`
              : `${doneTasks} of ${totalTasks} tasks completed`}
          </div>
          <div className="exos-focus-progress-wrap">
            <div className="exos-progress-track">
              <div
                className="exos-progress-fill"
                style={{
                  width: (focusTask.subtasks?.length
                    ? Math.round((focusTask.subtasks.filter((s) => s.done).length / focusTask.subtasks.length) * 100)
                    : pct) + "%",
                }}
              />
            </div>
            <div className="exos-focus-pct">
              {focusTask.subtasks?.length
                ? Math.round((focusTask.subtasks.filter((s) => s.done).length / focusTask.subtasks.length) * 100)
                : pct}%
            </div>
          </div>
          <div className="exos-focus-bottom">
            <div className="exos-focus-due">
              {focusTask.completed ? "Completed" : "In progress"} · Priority: {focusTask.priority}
              {focusTask.dueDate && <> · Due {formatNiceDate(focusTask.dueDate)}</>}
            </div>
            <button className="exos-focus-btn" onClick={() => goto("tasks")}>
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="exos-grid-2">
        <div className="exos-stack">
          <div className="exos-card exos-card-pad">
            <div className="exos-card-header">
              <div className="exos-card-title"><CalendarIcon size={16} color="var(--accent)" /> Upcoming Events</div>
              <button className="exos-card-link" onClick={() => goto("calendar")}>View calendar <ChevronRight size={13} /></button>
            </div>
            {upcoming.length === 0 && <div className="exos-empty-state">No upcoming events.<br />Add one from the Calendar page.</div>}
            {upcoming.map((ev) => (
              <div className="exos-event-item" key={ev.id}>
                <div className="exos-event-dot" style={{ background: ev.color }} />
                <div>
                  <div className="exos-event-when">{ev.date === today ? "Today" : formatNiceDate(ev.date)} · {ev.time}</div>
                  <div className="exos-event-title">{ev.title}</div>
                  {ev.location && <div className="exos-event-sub"><MapPin size={11} /> {ev.location}</div>}
                </div>
              </div>
            ))}
            <button className="exos-add-link" onClick={() => goto("calendar")}><Plus size={14} /> Open Calendar</button>
          </div>

          <div className="exos-card exos-card-pad">
            <div className="exos-card-header">
              <div className="exos-card-title"><FolderOpen size={16} color="var(--accent)" /> Recent Documents</div>
              <button className="exos-card-link" onClick={() => goto("documents")}>View all <ChevronRight size={13} /></button>
            </div>
            <div className="exos-doc-grid">
              {recentDocs.map((doc) => {
                const Icon = IconForDoc(doc.type);
                return (
                  <div key={doc.id} className="exos-doc-tile">
                    <div className="exos-doc-icon" style={{ background: colorForDoc(doc.type) }}><Icon size={17} /></div>
                    <div className="exos-doc-name">{doc.name}</div>
                    <div className="exos-doc-meta">{(doc.sizeKB / 1024).toFixed(1)} MB · {doc.updatedAt === today ? "Today" : formatNiceDate(doc.updatedAt)}</div>
                  </div>
                );
              })}
              {recentDocs.length === 0 && <div className="exos-empty-state">No documents yet.</div>}
            </div>
          </div>
        </div>

        <div className="exos-stack">
          <div className="exos-card exos-card-pad">
            <div className="exos-card-header">
              <div className="exos-card-title"><CheckSquare size={16} color="var(--accent)" /> Tasks</div>
              <button className="exos-card-link" onClick={() => goto("tasks")}>View all <ChevronRight size={13} /></button>
            </div>
            {data.tasks.sort((a, b) => {
    // Uncompleted tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Among unfinished tasks, high priority first
    if (!a.completed && !b.completed) {
      const priorityOrder = {
        High: 0,
        Medium: 1,
        Low: 2,
      };

      return (
        (priorityOrder[a.priority] ?? 1) -
        (priorityOrder[b.priority] ?? 1)
      );
    }

    return 0;
  })
  .slice(0, 4)
  .map((t) => (
    <TaskRow
      key={t.id}
      task={t}
      compact
    />
  ))}
            {data.tasks.length === 0 && <div className="exos-empty-state">No tasks yet.</div>}
            <button className="exos-add-link" onClick={() => goto("tasks")}><Plus size={14} /> New Task</button>
          </div>

          <div className="exos-card exos-card-pad">
            <div className="exos-card-header">
              <div className="exos-card-title"><Sparkles size={16} color="var(--accent)" /> AI Suggestions</div>
            </div>
            {suggestions.map((s, i) => (
              <div className="exos-suggestion" key={i}>
                <div className="exos-suggestion-icon" style={{ background: s.bg }}>{s.emoji}</div>
                <div className="exos-suggestion-text">{s.text}</div>
              </div>
            ))}
            {suggestions.length === 0 && <div className="exos-empty-state">You're all caught up.</div>}
          </div>
        </div>
      </div>

      <div className="exos-row-2">
        <div className="exos-card exos-card-pad">
          <div className="exos-card-header">
            <div className="exos-card-title"><FileText size={16} color="var(--accent)" /> Notes</div>
            <button className="exos-card-link" onClick={() => goto("notes")}>View all <ChevronRight size={13} /></button>
          </div>
          {data.notes.slice(0, 3).map((n) => (
            <div key={n.id} className="exos-list-row" style={{ alignItems: "flex-start" }}>
              <FileText size={14} color="var(--text-tertiary)" style={{ marginTop: 3 }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {n.content.slice(0, 70)}{n.content.length > 70 ? "…" : ""}
                </div>
              </div>
            </div>
          ))}
          {data.notes.length === 0 && <div className="exos-empty-state">No notes yet.</div>}
        </div>

        <div className="exos-card exos-card-pad">
          <div className="exos-card-header">
            <div className="exos-card-title"><Wallet size={16} color="var(--accent)" /> Finance Overview</div>
            <button className="exos-card-link" onClick={() => goto("finance")}>Open dashboard <ChevronRight size={13} /></button>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>This Month Spending</div>
          <div className="exos-stat-big">₹{totalSpend.toLocaleString("en-IN")}</div>
          <div className="exos-donut-wrap" style={{ marginTop: 16 }}>
            <Donut segments={byCategory.length ? byCategory : [{ value: 1, color: "var(--card-border)" }]} />
            <div style={{ flex: 1 }}>
              {byCategory.map((c) => (
                <div className="exos-legend-item" key={c.label}>
                  <span className="exos-legend-dot" style={{ background: c.color }} /> {c.label}
                  <span className="exos-legend-amt">₹{c.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
              {byCategory.length === 0 && <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No transactions yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}