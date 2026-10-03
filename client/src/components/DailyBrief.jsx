import React, { useMemo } from "react";
import { Sparkles, Flag, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { todayISO, formatWeekdayDate } from "../utils/date";

/**
 * A one-glance summary of the whole day, generated entirely from live
 * app data (tasks, events, documents, transactions) — nothing here is
 * hand-written copy, so it updates the moment anything changes elsewhere.
 */
export default function DailyBrief({ goto }) {
  const { data } = useApp();
  const today = todayISO();

  const stats = useMemo(() => {
    const pendingTasks = data.tasks.filter((t) => !t.completed);
    const todayEvents = data.events
      .filter((e) => e.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
    const docsToday = data.documents.filter((d) => d.updatedAt === today);

    // "spent this week" = last 7 calendar days including today
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoISO = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`;
    const spentThisWeek = data.transactions
      .filter((t) => t.date >= weekAgoISO)
      .reduce((s, t) => s + t.amount, 0);

    const focusTask =
      data.tasks.find((t) => t.id === data.focusTaskId) ||
      data.tasks.find((t) => !t.completed && t.priority === "High") ||
      data.tasks.find((t) => !t.completed);

    const nextEvent = data.events
      .filter((e) => e.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

    const highCount = pendingTasks.filter((t) => t.priority === "High").length;
    let recommendation;
    if (highCount > 0) {
      recommendation = "Complete your high-priority task before starting anything new.";
    } else if (pendingTasks.length > 0) {
      recommendation = "No high-priority items left — a good time to knock out something quick.";
    } else {
      recommendation = "Everything's clear — great moment to plan ahead or take a break.";
    }

    return { pendingTasks, todayEvents, docsToday, spentThisWeek, focusTask, nextEvent, recommendation };
  }, [data, today]);

  return (
    <div className="exos-brief-card">
      <div className="exos-brief-header">
        <Sparkles size={15} />
        <span>Your Daily Brief — {formatWeekdayDate(today)}</span>
      </div>

      <div className="exos-brief-stats">
        <div className="exos-brief-stat">
          <div className="exos-brief-stat-num">{stats.pendingTasks.length}</div>
          <div className="exos-brief-stat-label">{stats.pendingTasks.length === 1 ? "Task" : "Tasks"}</div>
        </div>
        <div className="exos-brief-stat">
          <div className="exos-brief-stat-num">{stats.todayEvents.length}</div>
          <div className="exos-brief-stat-label">{stats.todayEvents.length === 1 ? "Meeting" : "Meetings"}</div>
        </div>
        <div className="exos-brief-stat">
          <div className="exos-brief-stat-num">{stats.docsToday.length}</div>
          <div className="exos-brief-stat-label">{stats.docsToday.length === 1 ? "Document" : "Documents"}</div>
        </div>
        <div className="exos-brief-stat">
          <div className="exos-brief-stat-num">₹{stats.spentThisWeek.toLocaleString("en-IN")}</div>
          <div className="exos-brief-stat-label">Spent this week</div>
        </div>
      </div>

      <div className="exos-brief-divider" />

      <div className="exos-brief-rows">
        {stats.focusTask && (
          <div className="exos-brief-row" onClick={() => goto("tasks")}>
            <Flag size={14} />
            <span className="exos-brief-row-label">Priority</span>
            <span className="exos-brief-row-value">{stats.focusTask.title}</span>
          </div>
        )}
        {stats.nextEvent && (
          <div className="exos-brief-row" onClick={() => goto("calendar")}>
            <Clock size={14} />
            <span className="exos-brief-row-label">Next Event</span>
            <span className="exos-brief-row-value">{stats.nextEvent.title} — {stats.nextEvent.time}</span>
          </div>
        )}
        <div className="exos-brief-row exos-brief-recommendation">
          <Sparkles size={14} />
          <span className="exos-brief-row-label">AI Recommendation</span>
          <span className="exos-brief-row-value">{stats.recommendation}</span>
        </div>
      </div>
    </div>
  );
}