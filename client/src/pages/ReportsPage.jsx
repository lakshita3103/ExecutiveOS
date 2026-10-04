import React, { useMemo, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock3,
  CalendarDays,
  FileText,
  ArrowUpRight,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ReportsPage() {
  const { data } = useApp();

  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [report, setReport] = useState({
    summary: "",
    wins: [],
    focus: [],
    nextMoves: [],
  });

  const tasks = data?.tasks || [];
  const notes = data?.notes || [];
  const events = data?.events || data?.calendar || [];

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.completed === true ||
          task.status === "completed" ||
          task.status === "done"
      ).length,
    [tasks]
  );

  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return tasks.filter((task) => {
      if (
        task.completed === true ||
        task.status === "completed" ||
        task.status === "done"
      ) {
        return false;
      }

      return task.dueDate && task.dueDate < today;
    }).length;
  }, [tasks]);

  const meetingCount = events.length;
  const noteCount = notes.length;

  const productivityScore = useMemo(() => {
    if (!tasks.length) return 100;

    const score = Math.round(
      (completedTasks / tasks.length) * 100
    );

    return Math.max(0, Math.min(100, score));
  }, [tasks, completedTasks]);

  const generateReport = async () => {
    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const response = await fetch(`${API_URL}/api/reports`,  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks,
          events,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Report generation failed."
        );
      }

      setReport({
        summary: result?.summary || "",
        wins: Array.isArray(result?.wins) ? result.wins : [],
        focus: Array.isArray(result?.focus) ? result.focus : [],
        nextMoves: Array.isArray(result?.nextMoves)
          ? result.nextMoves
          : [],
      });

      setGenerated(true);
    } catch (err) {
      console.error("Report generation error:", err);

      setError(
        err?.message ||
          "I couldn't generate your report. Make sure the AI server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyBrief = async () => {
    const text = `
ExecutiveOS Weekly Executive Brief

Productivity: ${productivityScore}%

Completed tasks: ${completedTasks}
Overdue tasks: ${overdueTasks}
Meetings: ${meetingCount}
Notes: ${noteCount}

Summary:
${report.summary || "No summary generated."}

Wins:
${report.wins.length
  ? report.wins.map((item) => `- ${item}`).join("\n")
  : "- No wins generated."}

Focus:
${report.focus.length
  ? report.focus.map((item) => `- ${item}`).join("\n")
  : "- No focus items generated."}

Next Moves:
${report.nextMoves.length
  ? report.nextMoves.map((item) => `- ${item}`).join("\n")
  : "- No next moves generated."}
`.trim();

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="exos-reports-page">

      {/* HEADER */}
      <div className="exos-reports-header">
        <div>
          <div className="exos-premium-eyebrow">
            <span className="exos-status-dot" />
            EXECUTIVE+ AI
          </div>

          <h1 className="exos-reports-title">
            Executive Reports
          </h1>

          <p className="exos-reports-subtitle">
            Your week, distilled into insights and decisions.
          </p>
        </div>

        <button
          className="exos-report-generate-btn"
          onClick={generateReport}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw
                size={17}
                className="exos-spin"
              />
              Analyzing...
            </>
          ) : generated ? (
            <>
              <RefreshCw size={17} />
              Refresh Report
            </>
          ) : (
            <>
              <Sparkles size={17} />
              Generate Report
            </>
          )}

          {!loading && <ArrowUpRight size={16} />}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="exos-report-error">
          <strong>Report generation failed</strong>
          <span>{error}</span>
        </div>
      )}

      {/* PRODUCTIVITY CARD */}
      <section className="exos-report-main-card">

        <div className="exos-report-card-top">

          <div>
            <div className="exos-report-card-label">
              <TrendingUp size={17} />
              THIS WEEK'S PRODUCTIVITY
            </div>

            <div className="exos-report-score">
              {productivityScore}%
            </div>

            <div className="exos-report-score-text">
              <span className="exos-score-dot" />
              {productivityScore >= 75
                ? "Strong performance"
                : productivityScore >= 50
                ? "Steady progress"
                : "Needs attention"}
            </div>
          </div>

          <div className="exos-report-score-ring">
            <div className="exos-report-score-ring-inner">
              {productivityScore}%
            </div>
          </div>

        </div>

        <p className="exos-report-description">
          Based on your task completion, workload, meetings,
          and activity inside ExecutiveOS.
        </p>

        {/* STATS */}
        <div className="exos-report-stats">

          <div className="exos-report-stat">
            <div className="exos-report-stat-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <div className="exos-report-stat-value">
                {completedTasks}
              </div>

              <div className="exos-report-stat-label">
                Completed
              </div>
            </div>
          </div>

          <div className="exos-report-stat">
            <div className="exos-report-stat-icon">
              <Clock3 size={18} />
            </div>

            <div>
              <div className="exos-report-stat-value">
                {overdueTasks}
              </div>

              <div className="exos-report-stat-label">
                Overdue
              </div>
            </div>
          </div>

          <div className="exos-report-stat">
            <div className="exos-report-stat-icon">
              <CalendarDays size={18} />
            </div>

            <div>
              <div className="exos-report-stat-value">
                {meetingCount}
              </div>

              <div className="exos-report-stat-label">
                Meetings
              </div>
            </div>
          </div>

          <div className="exos-report-stat">
            <div className="exos-report-stat-icon">
              <FileText size={18} />
            </div>

            <div>
              <div className="exos-report-stat-value">
                {noteCount}
              </div>

              <div className="exos-report-stat-label">
                Notes
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* AI BRIEF */}
      <section className="exos-ai-brief-card">

        <div className="exos-ai-brief-header">

          <div className="exos-ai-brief-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <div className="exos-ai-brief-label">
              AI EXECUTIVE BRIEF
            </div>

            <h2>
              Your week in perspective
            </h2>
          </div>

          {generated && (
            <div className="exos-ai-ready">
              <span />
              AI READY
            </div>
          )}

        </div>

        {!generated ? (
          <div className="exos-report-empty">

            <div className="exos-report-empty-icon">
              <Sparkles size={22} />
            </div>

            <h3>
              Turn your activity into insight
            </h3>

            <p>
              Generate your weekly executive brief to uncover
              wins, priorities, and areas that need attention.
            </p>

            <button
              className="exos-report-secondary-btn"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={16}
                    className="exos-spin"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate AI Brief
                </>
              )}
            </button>

          </div>
        ) : (
          <div className="exos-report-generated">

            {/* SUMMARY */}
            {report.summary && (
              <div className="exos-report-summary">
                <div className="exos-report-summary-label">
                  EXECUTIVE SUMMARY
                </div>

                <p>
                  {report.summary}
                </p>
              </div>
            )}

            {/* WINS */}
            <div className="exos-report-insight">
              <span className="exos-insight-number">
                01
              </span>

              <div>
                <strong>WINS</strong>

                {report.wins.length > 0 ? (
                  <ul className="exos-report-list">
                    {report.wins.map((item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No major wins were identified from the
                    available activity.
                  </p>
                )}
              </div>
            </div>

            {/* FOCUS */}
            <div className="exos-report-insight">
              <span className="exos-insight-number">
                02
              </span>

              <div>
                <strong>FOCUS</strong>

                {report.focus.length > 0 ? (
                  <ul className="exos-report-list">
                    {report.focus.map((item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No immediate focus areas were identified.
                  </p>
                )}
              </div>
            </div>

            {/* NEXT MOVES */}
            <div className="exos-report-insight">
              <span className="exos-insight-number">
                03
              </span>

              <div>
                <strong>NEXT MOVE</strong>

                {report.nextMoves.length > 0 ? (
                  <ul className="exos-report-list">
                    {report.nextMoves.map((item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No next moves were generated.
                  </p>
                )}
              </div>
            </div>

            {/* COPY */}
            <button
              className="exos-report-copy-btn"
              onClick={copyBrief}
            >
              <Copy size={15} />
              {copied
                ? "Copied"
                : "Copy Executive Brief"}
            </button>

          </div>
        )}

      </section>

    </div>
  );
}