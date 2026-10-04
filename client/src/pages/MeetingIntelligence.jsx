import React, { useState } from "react";
import {
  Video,
  Sparkles,
  CheckCircle2,
  ListTodo,
  Clock3,
  Copy,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const EXAMPLE_MEETING = `Meeting: Product Review
Date: Today
Attendees: Product, Engineering, Design

We reviewed the progress of the new dashboard.

The engineering team confirmed that the core dashboard is almost complete.
Design will finalize the remaining mobile layouts tomorrow.
The product team wants the first internal release by Friday.

Action items:
- Engineering: finish dashboard testing
- Design: complete mobile layouts
- Product: prepare internal release notes

The team also discussed improving onboarding and reducing the number of steps
required for new users.`;

export default function MeetingIntelligence() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadExample = () => {
    setNotes(EXAMPLE_MEETING);
    setResult(null);
    setError("");
  };

  const analyzeMeeting = async () => {
    if (!notes.trim()) {
      setError("Add your meeting notes first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/meeting-intelligence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Meeting analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "I couldn't reach the AI server. Make sure your Gemini server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  };

  const copySummary = async () => {
    if (!result) return;

    const text = [
      result.summary ? `SUMMARY\n${result.summary}` : "",
      result.decisions?.length
        ? `\nDECISIONS\n${result.decisions.map((x) => `• ${x}`).join("\n")}`
        : "",
      result.actionItems?.length
        ? `\nACTION ITEMS\n${result.actionItems
            .map(
              (x) =>
                `• ${x.task}${x.owner ? ` — ${x.owner}` : ""}${
                  x.deadline ? ` — ${x.deadline}` : ""
                }`
            )
            .join("\n")}`
        : "",
      result.nextSteps?.length
        ? `\nNEXT STEPS\n${result.nextSteps.map((x) => `• ${x}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="exos-meeting-page">
      <div className="exos-meeting-header">
        <div>
          <div className="exos-premium-eyebrow">
            <span className="exos-premium-dot" />
            EXECUTIVE+ AI
          </div>

          <h1 className="exos-premium-title">Meeting Intelligence</h1>

          <p className="exos-premium-subtitle">
            Turn meeting notes into clear summaries, decisions, and action items.
          </p>
        </div>

        <div className="exos-meeting-header-icon">
          <Video size={24} />
        </div>
      </div>

      <div className="exos-meeting-grid">
        <section className="exos-meeting-composer">
          <div className="exos-meeting-card-top">
            <div>
              <div className="exos-meeting-card-title">
                <Sparkles size={18} />
                Analyze Meeting
              </div>

              <div className="exos-meeting-card-subtitle">
                Paste your notes, transcript, or discussion points.
              </div>
            </div>

            <button
              className="exos-example-btn"
              onClick={loadExample}
              type="button"
            >
              Try an example
            </button>
          </div>

          <textarea
            className="exos-meeting-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste meeting notes here..."
          />

          <div className="exos-meeting-footer">
            <span className="exos-meeting-tip">
              <Sparkles size={14} />
              ExecutiveOS will identify the important details for you.
            </span>

            <button
              className="exos-ai-button"
              onClick={analyzeMeeting}
              disabled={loading}
            >
              <Sparkles size={16} />
              {loading ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>

          {error && <div className="exos-ai-error">{error}</div>}
        </section>

        <section className="exos-meeting-result">
          {!result && !loading && (
            <div className="exos-empty-ai">
              <div className="exos-empty-ai-icon">
                <Sparkles size={24} />
              </div>

              <h3>Your meeting intelligence</h3>

              <p>
                Your AI-generated summary, decisions, and action items will
                appear here.
              </p>
            </div>
          )}

          {loading && (
            <div className="exos-empty-ai">
              <div className="exos-ai-loading">
                <Sparkles size={24} />
              </div>

              <h3>Analyzing your meeting...</h3>

              <p>
                ExecutiveOS is identifying the key decisions and follow-ups.
              </p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="exos-result-header">
                <div>
                  <div className="exos-result-eyebrow">
                    <span className="exos-premium-dot" />
                    AI MEETING INSIGHTS
                  </div>

                  <h2>Meeting Summary</h2>
                </div>

                <button
                  className="exos-copy-btn"
                  onClick={copySummary}
                  title="Copy summary"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="exos-summary-box">
                <p>{result.summary}</p>
              </div>

              {result.decisions?.length > 0 && (
                <div className="exos-result-section">
                  <div className="exos-result-section-title">
                    <CheckCircle2 size={17} />
                    Decisions
                  </div>

                  <ul>
                    {result.decisions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.actionItems?.length > 0 && (
                <div className="exos-result-section">
                  <div className="exos-result-section-title">
                    <ListTodo size={17} />
                    Action Items
                  </div>

                  <div className="exos-action-list">
                    {result.actionItems.map((item, index) => (
                      <div className="exos-action-item" key={index}>
                        <div>
                          <strong>{item.task}</strong>

                          <div className="exos-action-meta">
                            {item.owner && <span>{item.owner}</span>}
                            {item.deadline && (
                              <span>
                                <Clock3 size={12} />
                                {item.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.nextSteps?.length > 0 && (
                <div className="exos-result-section">
                  <div className="exos-result-section-title">
                    <ListTodo size={17} />
                    Next Steps
                  </div>

                  <ul>
                    {result.nextSteps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}