import React, { useState } from "react";
import {
  Mail,
  Sparkles,
  Wand2,
  Reply,
  FileText,
  Copy,
  Check,
  ArrowUpRight,
  Clock3,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { usePremium } from "../context/PremiumContext";

const MODES = [
  {
    id: "write",
    label: "Write Email",
    icon: Wand2,
    description: "Create a polished email from your instructions.",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    icon: Sparkles,
    description: "Improve an existing email while keeping your meaning.",
  },
  {
    id: "reply",
    label: "Reply",
    icon: Reply,
    description: "Create a thoughtful reply to an email.",
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: FileText,
    description: "Turn a long email into a clear summary.",
  },
];

const EXAMPLES = {
  write:
    "Turn these meeting notes into a concise follow-up email with clear action items.",

  rewrite:
    "Make this email more professional, confident, and concise while keeping the original meaning.",

  reply:
    "Write a warm and professional reply confirming that I can attend the meeting.",

  summarize:
    "Summarize this email into the key points, decisions, deadlines, and action items.",
};

export default function AIEmailCopilot() {
  const { isPremium } = usePremium();

  const [mode, setMode] = useState("write");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const activeMode =
    MODES.find((item) => item.id === mode) || MODES[0];

  const ExampleIcon = activeMode.icon;

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResult("");
    setSubject("");
    setError("");
  };

  const useExample = () => {
    setInstruction(EXAMPLES[mode]);
    setError("");
  };

  const clearComposer = () => {
    setInstruction("");
    setResult("");
    setSubject("");
    setError("");
    setCopied(false);
  };

  const generateWithAI = async () => {
    const trimmed = instruction.trim();

    if (!trimmed) {
      setError("Tell ExecutiveOS what you want the AI to create first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setSubject("");
    setCopied(false);

    try {
      const modeInstructions = {
        write: `
You are an expert executive email writer.

Create a polished professional email based on the user's instruction.

Return:
SUBJECT: <short professional subject>

<email body>

Make it concise, natural, confident, and ready to send.
Do not explain what you did.
Do not use markdown headings.
`,

        rewrite: `
You are an expert executive communication editor.

Rewrite the user's email so it is:
- professional
- concise
- confident
- natural
- clear

Preserve the original meaning and important information.

Return:
SUBJECT: <subject if one can be inferred>

<rewritten email>

Do not explain the changes.
`,

        reply: `
You are an expert executive email assistant.

Write a professional reply to the email or situation provided by the user.

The reply should:
- sound natural
- be concise
- address the important points
- have an appropriate professional tone
- be ready to send

Return:
SUBJECT: <short reply subject>

<email body>

Do not explain your response.
`,

        summarize: `
You are an executive email summarization assistant.

Summarize the user's email clearly.

Include:
- Key points
- Decisions
- Deadlines
- Action items

Keep it concise and easy to scan.

Do not invent information that is not present.
`,
      };

      const prompt = `
${modeInstructions[mode]}

USER REQUEST:
${trimmed}

Generate the final result now.
`;

      const response = await fetch("http://localhost:3001/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          context: `
This request comes from ExecutiveOS Premium — AI Email Copilot.

Current email mode: ${activeMode.label}

The user wants an email-related AI operation.
Do not create, update, delete, or modify tasks, calendar events, or notes.
Return the generated email content in the message field.
`,
        }),
      });

      if (!response.ok) {
        throw new Error("AI server returned an error.");
      }

      const data = await response.json();

      let generated = data?.message || "";

      if (!generated) {
        throw new Error("The AI returned an empty response.");
      }

      generated = generated.trim();

      if (generated.startsWith("```")) {
        generated = generated
          .replace(/^```[a-zA-Z]*\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
      }

      const subjectMatch = generated.match(
        /^SUBJECT:\s*(.+?)(?:\n|$)/i
      );

      if (subjectMatch) {
        setSubject(subjectMatch[1].trim());

        generated = generated
          .replace(subjectMatch[0], "")
          .trim();
      }

      setResult(generated);
    } catch (err) {
      console.error("Email Copilot error:", err);

      setError(
        "I couldn't reach the AI server. Make sure your Gemini server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;

    const text = subject
      ? `Subject: ${subject}\n\n${result}`
      : result;

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

  if (!isPremium) {
    return (
      <div className="exos-page">
        <div className="exos-card exos-card-pad">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: "rgba(214,106,117,.12)",
              }}
            >
              <Mail size={21} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#d66a75",
                }}
              >
                Executive+
              </div>

              <h1 style={{ margin: "3px 0 0" }}>
                AI Email Copilot
              </h1>
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)" }}>
            AI Email Copilot is available with Executive+.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="exos-email-copilot-page">
      {/* HEADER */}
      <div className="exos-email-page-header">
        <div>
          <div className="exos-email-eyebrow">
            <span className="exos-email-status-dot" />
            EXECUTIVE+ AI
          </div>

          <h1 className="exos-email-page-title">
            AI Email Copilot
          </h1>

          <p className="exos-email-page-subtitle">
            Write sharper emails, reply faster, and communicate with confidence.
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="exos-email-grid">
        {/* LEFT / COMPOSER */}
        <section className="exos-email-composer-card">
          {/* CARD HEADER */}
          <div className="exos-email-card-header">
            <div className="exos-email-card-heading">
              <div className="exos-email-icon-box">
                <Mail size={20} />
              </div>

              <div>
                <h2>Compose with AI</h2>
                <p>Tell ExecutiveOS what you need</p>
              </div>
            </div>

            <div className="exos-email-ai-status">
              <Clock3 size={14} />
              AI ready
            </div>
          </div>

          {/* MODES */}
          <div className="exos-email-modes">
            {MODES.map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    "exos-email-mode" +
                    (active ? " active" : "")
                  }
                  onClick={() => handleModeChange(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* MODE DESCRIPTION */}
          <div className="exos-email-mode-description">
            <ExampleIcon size={15} />
            <span>{activeMode.description}</span>
          </div>

          {/* TEXTAREA AREA */}
          <div className="exos-email-input-wrap">
            <div className="exos-email-input-top">
              <span>Your instruction</span>

              <span>
                {instruction.length} characters
              </span>
            </div>

            <textarea
              className="exos-email-textarea"
              value={instruction}
              onChange={(e) => {
                setInstruction(e.target.value);
                setError("");
              }}
              placeholder="Tell ExecutiveOS what you want to write..."
              spellCheck="true"
            />

            {/* EXAMPLE */}
            <div className="exos-email-example">
              <div className="exos-email-example-icon">
                <Lightbulb size={14} />
              </div>

              <div className="exos-email-example-content">
                <div className="exos-email-example-label">
                  Example
                </div>

                <div className="exos-email-example-text">
                  “{EXAMPLES[mode]}”
                </div>
              </div>

              <button
                type="button"
                className="exos-email-example-use"
                onClick={useExample}
              >
                Try example
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="exos-email-error">
              {error}
            </div>
          )}

          {/* FOOTER */}
          <div className="exos-email-composer-footer">
            <div className="exos-email-tip">
              <Sparkles size={15} />
              <span>
                Be specific about the audience, tone, and outcome.
              </span>
            </div>

            <div className="exos-email-actions">
              <button
                type="button"
                className="exos-email-clear-btn"
                onClick={clearComposer}
                disabled={loading}
              >
                <RotateCcw size={14} />
                Clear
              </button>

              <button
                type="button"
                className="exos-email-generate-btn"
                onClick={generateWithAI}
                disabled={loading || !instruction.trim()}
              >
                {loading ? (
                  <>
                    <span className="exos-email-spinner" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Generate with AI
                    <ArrowUpRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT / RESULT */}
        <section className="exos-email-result-card">
          <div className="exos-email-result-header">
            <div>
              <div className="exos-email-result-eyebrow">
                <span />
                AI OUTPUT
              </div>

              <h2>
                {result ? "Your polished result" : "Ready when you are"}
              </h2>

              <p>
                {result
                  ? "Review, copy, and send when it looks right."
                  : "Your generated email will appear here."}
              </p>
            </div>

            {result && (
              <button
                type="button"
                className="exos-email-copy-btn"
                onClick={copyResult}
                title="Copy result"
              >
                {copied ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            )}
          </div>

          {result ? (
            <div className="exos-email-result-content">
              {subject && (
                <div className="exos-email-subject">
                  <span>Subject</span>
                  <strong>{subject}</strong>
                </div>
              )}

              <div className="exos-email-result-body">
                {result.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < result.split("\n").length - 1 && (
                      <br />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="exos-email-result-footer">
                <span>
                  <Sparkles size={13} />
                  Generated by ExecutiveOS AI
                </span>

                <button
                  type="button"
                  onClick={copyResult}
                >
                  {copied ? (
                    <>
                      <Check size={13} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy email
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="exos-email-empty-result">
              <div className="exos-email-empty-icon">
                <Sparkles size={24} />
              </div>

              <h3>
                Your AI result will appear here
              </h3>

              <p>
                Describe the email you need on the left,
                then let ExecutiveOS turn your idea into
                polished professional communication.
              </p>

              <div className="exos-email-empty-hint">
                <span>1</span>
                Describe what you need
              </div>

              <div className="exos-email-empty-hint">
                <span>2</span>
                Generate with AI
              </div>

              <div className="exos-email-empty-hint">
                <span>3</span>
                Review and copy
              </div>
            </div>
          )}
        </section>
      </div>

      {/* BOTTOM EXAMPLE CARD */}
      <div className="exos-email-example-banner">
        <div className="exos-email-example-banner-icon">
          <Sparkles size={18} />
        </div>

        <div>
          <div className="exos-email-example-banner-title">
            TRY AN EXAMPLE
          </div>

          <div className="exos-email-example-banner-text">
            Ask ExecutiveOS to prepare a project update,
            create a diplomatic reply, or turn a long email
            into clear action items.
          </div>
        </div>

        <button
          type="button"
          onClick={useExample}
        >
          Try it
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}