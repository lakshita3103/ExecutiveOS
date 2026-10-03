import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Bot, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { todayISO, uid } from "../utils/date";

const PROXY_URL =
  import.meta.env.VITE_AI_PROXY_URL ||
  "http://localhost:3001/api/assistant";


function buildContext(data) {
  const pending =
    data.tasks
      .filter((t) => !t.completed)
      .map(
        (t) =>
          `- ${t.title} (${t.priority}, due: ${
            t.dueDate || "none"
          })`
      )
      .join("\n") || "none";

  const completed =
    data.tasks
      .filter((t) => t.completed)
      .map((t) => `- ${t.title}`)
      .join("\n") || "none";

  const events =
    data.events
      .filter((e) => e.date >= todayISO())
      .sort((a, b) =>
        (a.date + a.time).localeCompare(
          b.date + b.time
        )
      )
      .slice(0, 10)
      .map(
        (e) =>
          `- ${e.date} ${e.time}: ${e.title}${
            e.location
              ? " @ " + e.location
              : ""
          }`
      )
      .join("\n") || "none";

  const notes =
    data.notes
      .slice(0, 10)
      .map(
        (n) =>
          `- ${n.title}: ${
            n.content || "empty"
          }`
      )
      .join("\n") || "none";

  const spend =
    data.transactions.reduce(
      (sum, t) =>
        sum + Number(t.amount || 0),
      0
    );

  return {
    pending,
    completed,
    events,
    notes,
    spend,
  };
}


function buildContextSummary(data) {
  const {
    pending,
    completed,
    events,
    notes,
    spend,
  } = buildContext(data);

  return `User name: ${
    data.user?.name || "User"
  }

TODAY:
${todayISO()}

OPEN TASKS:
${pending}

COMPLETED TASKS:
${completed}

UPCOMING EVENTS:
${events}

EXISTING NOTES:
${notes}

TOTAL SPENDING THIS MONTH:
₹${spend.toLocaleString("en-IN")}`;
}


function findBestMatch(
  items,
  query,
  getText
) {
  const normalizedQuery =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!normalizedQuery) {
    return {
      item: null,
      multiple: false,
    };
  }

  const exact =
    items.filter(
      (item) =>
        getText(item)
          .trim()
          .toLowerCase() ===
        normalizedQuery
    );

  if (exact.length === 1) {
    return {
      item: exact[0],
      multiple: false,
    };
  }

  if (exact.length > 1) {
    return {
      item: null,
      multiple: true,
    };
  }

  const partial =
    items.filter((item) =>
      getText(item)
        .toLowerCase()
        .includes(normalizedQuery)
    );

  if (partial.length === 1) {
    return {
      item: partial[0],
      multiple: false,
    };
  }

  if (partial.length > 1) {
    return {
      item: null,
      multiple: true,
    };
  }

  return {
    item: null,
    multiple: false,
  };
}


function localAnswer(question, data) {
  const q =
    question.toLowerCase();

  const {
    pending,
    events,
    spend,
  } = buildContext(data);

  if (
    q.includes("focus") ||
    q.includes("today")
  ) {
    const high =
      data.tasks.find(
        (t) =>
          !t.completed &&
          t.priority === "High"
      );

    if (high) {
      return `I'd focus on "${high.title}" first — it's marked High priority and still open.`;
    }

    const any =
      data.tasks.find(
        (t) => !t.completed
      );

    return any
      ? `Nothing high-priority is pending, so "${any.title}" is a good next task.`
      : "You've cleared every task — nice work!";
  }

  if (
    q.includes("event") ||
    q.includes("schedule") ||
    q.includes("calendar") ||
    q.includes("meeting")
  ) {
    return `Here's what's on your calendar:\n${events}`;
  }

  if (
    q.includes("spend") ||
    q.includes("finance") ||
    q.includes("money") ||
    q.includes("budget")
  ) {
    return `You've spent ₹${spend.toLocaleString(
      "en-IN"
    )} so far this month.`;
  }

  if (q.includes("task")) {
    return `Your open tasks:\n${pending}`;
  }

  return `Here's a quick snapshot:

Pending tasks:
${pending}

Upcoming events:
${events}

Spending this month:
₹${spend.toLocaleString(
    "en-IN"
  )}`;
}


export default function AIAssistant() {
  const { data, patch } =
    useApp();

  // Chat history lives in the shared per-user app data (persisted to
  // localStorage, isolated per account). This always resolves the
  // "current" list from the *latest* app state (via patch's functional
  // form) rather than the `messages` value captured in this render's
  // closure — important because `send()` below calls setMessages twice
  // (once synchronously, once after the AI reply comes back), and by the
  // second call the closure would otherwise still point at the array
  // from before the first update, silently dropping messages in between.
  const messages = data.assistantMessages || [];
  const setMessages = (updater) => {
    patch((prevData) => {
      const prevMessages = prevData.assistantMessages || [];
      const next =
        typeof updater === "function"
          ? updater(prevMessages)
          : updater;
      return { assistantMessages: next };
    });
  };

  const [
    input,
    setInput,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    backendError,
    setBackendError,
  ] = useState(false);

  const logRef =
    useRef(null);


  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop =
        logRef.current.scrollHeight;
    }
  }, [messages, busy]);


  const contextSummary =
    useMemo(
      () =>
        buildContextSummary(
          data
        ),
      [data]
    );


  const executeAction = (
    result
  ) => {

    /* ==========================
       CREATE TASK
       ========================== */

    if (
      result.action ===
      "create_task"
    ) {
      const task =
        result.task || {};

      const title =
        String(
          task.title || ""
        ).trim();

      if (!title) {
        throw new Error(
          "Missing task title."
        );
      }

      const priority =
        ["Low", "Medium", "High"].includes(
          task.priority
        )
          ? task.priority
          : "Medium";

      const dueDate =
        typeof task.dueDate ===
          "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
          task.dueDate
        )
          ? task.dueDate
          : null;

      const newTask = {
        id: uid(),
        title,
        priority,
        completed: false,
        dueDate,
        createdAt: todayISO(),
        subtasks: [],
      };

      patch({
        tasks: [
          ...data.tasks,
          newTask,
        ],
      });

      return (
        result.message ||
        `Done — I created "${title}".`
      );
    }


    /* ==========================
       UPDATE TASK
       ========================== */

    if (
      result.action ===
      "update_task"
    ) {
      const match =
        findBestMatch(
          data.tasks,
          result.taskQuery,
          (t) => t.title
        );

      if (match.multiple) {
        return "I found multiple tasks that could match that. Please give me the exact task name.";
      }

      if (!match.item) {
        return `I couldn't find a task matching "${result.taskQuery}".`;
      }

      const changes =
        result.changes || {};

      const updatedTasks =
        data.tasks.map((task) =>
          task.id ===
          match.item.id
            ? {
                ...task,
                ...(changes.title
                  ? {
                      title: String(
                        changes.title
                      ).trim(),
                    }
                  : {}),
                ...(changes.priority &&
                [
                  "Low",
                  "Medium",
                  "High",
                ].includes(
                  changes.priority
                )
                  ? {
                      priority:
                        changes.priority,
                    }
                  : {}),
                ...(changes.dueDate !==
                undefined
                  ? {
                      dueDate:
                        changes.dueDate ||
                        null,
                    }
                  : {}),
              }
            : task
        );

      patch({
        tasks: updatedTasks,
      });

      return (
        result.message ||
        `Done — I updated "${match.item.title}".`
      );
    }


    /* ==========================
       COMPLETE TASK
       ========================== */

    if (
      result.action ===
      "complete_task"
    ) {
      const match =
        findBestMatch(
          data.tasks,
          result.taskQuery,
          (t) => t.title
        );

      if (match.multiple) {
        return "I found multiple tasks that could match that. Please give me the exact task name.";
      }

      if (!match.item) {
        return `I couldn't find a task matching "${result.taskQuery}".`;
      }

      patch({
        tasks: data.tasks.map(
          (task) =>
            task.id ===
            match.item.id
              ? {
                  ...task,
                  completed: true,
                }
              : task
        ),
      });

      return (
        result.message ||
        `Done — I marked "${match.item.title}" as complete.`
      );
    }


    /* ==========================
       DELETE TASK
       ========================== */

    if (
      result.action ===
      "delete_task"
    ) {
      const match =
        findBestMatch(
          data.tasks,
          result.taskQuery,
          (t) => t.title
        );

      if (match.multiple) {
        return "I found multiple tasks that could match that. Please give me the exact task name.";
      }

      if (!match.item) {
        return `I couldn't find a task matching "${result.taskQuery}".`;
      }

      patch({
        tasks: data.tasks.filter(
          (task) =>
            task.id !==
            match.item.id
        ),
        focusTaskId:
          data.focusTaskId ===
          match.item.id
            ? null
            : data.focusTaskId,
      });

      return (
        result.message ||
        `Done — I deleted "${match.item.title}".`
      );
    }


    /* ==========================
       SET FOCUS
       ========================== */

    if (
      result.action ===
      "set_focus"
    ) {
      const match =
        findBestMatch(
          data.tasks,
          result.taskQuery,
          (t) => t.title
        );

      if (match.multiple) {
        return "I found multiple tasks that could match that. Please give me the exact task name.";
      }

      if (!match.item) {
        return `I couldn't find a task matching "${result.taskQuery}".`;
      }

      patch({
        focusTaskId:
          match.item.id,
      });

      return (
        result.message ||
        `Done — "${match.item.title}" is now today's focus.`
      );
    }


    /* ==========================
       CREATE EVENT
       ========================== */

    if (
      result.action ===
      "create_event"
    ) {
      const event =
        result.event || {};

      const title =
        String(
          event.title || ""
        ).trim();

      const date =
        typeof event.date ===
          "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
          event.date
        )
          ? event.date
          : null;

      const time =
        String(
          event.time || ""
        ).trim();

      if (!title || !date || !time) {
        throw new Error(
          "Missing event information."
        );
      }

      const newEvent = {
        id: uid(),
        date,
        time,
        title,
        location:
          String(
            event.location || ""
          ).trim(),
        duration:
          String(
            event.duration ||
              "1h"
          ).trim() || "1h",
        color: "#6B3FA0",
      };

      patch({
        events: [
          ...data.events,
          newEvent,
        ],
      });

      return (
        result.message ||
        `Done — I scheduled "${title}".`
      );
    }


    /* ==========================
       UPDATE EVENT
       ========================== */

    if (
      result.action ===
      "update_event"
    ) {
      const match =
        findBestMatch(
          data.events,
          result.eventQuery,
          (e) => e.title
        );

      if (match.multiple) {
        return "I found multiple events that could match that. Please give me the exact event name.";
      }

      if (!match.item) {
        return `I couldn't find an event matching "${result.eventQuery}".`;
      }

      const changes =
        result.changes || {};

      patch({
        events: data.events.map(
          (event) =>
            event.id ===
            match.item.id
              ? {
                  ...event,
                  ...changes,
                  title:
                    changes.title !==
                    undefined
                      ? String(
                          changes.title
                        ).trim()
                      : event.title,
                  location:
                    changes.location !==
                    undefined
                      ? String(
                          changes.location
                        ).trim()
                      : event.location,
                  duration:
                    changes.duration !==
                    undefined
                      ? String(
                          changes.duration
                        ).trim()
                      : event.duration,
                }
              : event
        ),
      });

      return (
        result.message ||
        `Done — I updated "${match.item.title}".`
      );
    }


    /* ==========================
       DELETE EVENT
       ========================== */

    if (
      result.action ===
      "delete_event"
    ) {
      const match =
        findBestMatch(
          data.events,
          result.eventQuery,
          (e) => e.title
        );

      if (match.multiple) {
        return "I found multiple events that could match that. Please give me the exact event name.";
      }

      if (!match.item) {
        return `I couldn't find an event matching "${result.eventQuery}".`;
      }

      patch({
        events: data.events.filter(
          (event) =>
            event.id !==
            match.item.id
        ),
      });

      return (
        result.message ||
        `Done — I deleted "${match.item.title}".`
      );
    }


    /* ==========================
       CREATE NOTE
       ========================== */

    if (
      result.action ===
      "create_note"
    ) {
      const note =
        result.note || {};

      const newNote = {
        id: uid(),
        title:
          String(
            note.title ||
              "Untitled Note"
          ).trim() ||
          "Untitled Note",
        content:
          String(
            note.content || ""
          ).trim(),
        updatedAt:
          todayISO(),
      };

      patch({
        notes: [
          newNote,
          ...data.notes,
        ],
      });

      return (
        result.message ||
        `Done — I created "${newNote.title}".`
      );
    }


    /* ==========================
       UPDATE NOTE
       ========================== */

    if (
      result.action ===
      "update_note"
    ) {
      const match =
        findBestMatch(
          data.notes,
          result.noteQuery,
          (n) => n.title
        );

      if (match.multiple) {
        return "I found multiple notes that could match that. Please give me the exact note title.";
      }

      if (!match.item) {
        return `I couldn't find a note matching "${result.noteQuery}".`;
      }

      const changes =
        result.changes || {};

      patch({
        notes: data.notes.map(
          (note) =>
            note.id ===
            match.item.id
              ? {
                  ...note,
                  ...(changes.title !==
                  undefined
                    ? {
                        title: String(
                          changes.title
                        ).trim(),
                      }
                    : {}),
                  ...(changes.content !==
                  undefined
                    ? {
                        content: String(
                          changes.content
                        ),
                      }
                    : {}),
                  updatedAt:
                    todayISO(),
                }
              : note
        ),
      });

      return (
        result.message ||
        `Done — I updated "${match.item.title}".`
      );
    }


    /* ==========================
       DELETE NOTE
       ========================== */

    if (
      result.action ===
      "delete_note"
    ) {
      const match =
        findBestMatch(
          data.notes,
          result.noteQuery,
          (n) => n.title
        );

      if (match.multiple) {
        return "I found multiple notes that could match that. Please give me the exact note title.";
      }

      if (!match.item) {
        return `I couldn't find a note matching "${result.noteQuery}".`;
      }

      patch({
        notes: data.notes.filter(
          (note) =>
            note.id !==
            match.item.id
        ),
      });

      return (
        result.message ||
        `Done — I deleted "${match.item.title}".`
      );
    }


    /* ==========================
       NORMAL RESPONSE
       ========================== */

    return (
      result.message ||
      "Done."
    );
  };


  const send = async (
    text
  ) => {
    const content =
      (text ?? input).trim();

    if (
      !content ||
      busy
    ) {
      return;
    }

    const next = [
      ...messages,
      {
        role: "user",
        content,
      },
    ];

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content,
      },
    ]);
    setInput("");
    setBusy(true);
    setBackendError(false);

    try {
      const res =
        await fetch(
          PROXY_URL,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              messages: next,
              context:
                contextSummary,
            }),
          }
        );

      if (!res.ok) {
        throw new Error(
          `Server returned ${res.status}`
        );
      }

      const result =
        await res.json();

      const textOut =
        executeAction(
          result
        );

      setMessages(
        (current) => [
          ...current,
          {
            role:
              "assistant",
            content:
              textOut,
          },
        ]
      );
    } catch (error) {
      console.error(
        "AI request failed:",
        error
      );

      setBackendError(true);

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            300
          )
      );

      const fallback =
        localAnswer(
          content,
          data
        );

      setMessages(
        (current) => [
          ...current,
          {
            role:
              "assistant",
            content:
              "I couldn't reach the AI server, so here's an answer from your local ExecutiveOS data:\n\n" +
              fallback,
          },
        ]
      );
    } finally {
      setBusy(false);
    }
  };


  return (
    <>
      <div className="exos-page-title">
        AI Assistant
      </div>

      <div className="exos-page-sub">
        Ask about your tasks,
        calendar, notes, or
        spending — or tell me
        to make changes for you.
      </div>

      {backendError && (
        <div className="exos-ai-notice">
          The AI server could
          not be reached.
          ExecutiveOS is using
          its local assistant
          fallback.
        </div>
      )}

      <div className="exos-card exos-card-pad exos-chat-wrap">
        <div
          className="exos-chat-log"
          ref={logRef}
        >
          {messages.length ===
            0 && (
            <div className="exos-chat-empty">
              <Bot size={30} />

              <div>
                Ask me anything
                about your day.
              </div>

              <div className="exos-chip-row">
                {[
                  "What should I focus on today?",
                  "Show my upcoming events",
                  "Create a high priority task called Test Task",
                  "Mark Test Task as complete",
                  "Make Test Task my focus",
                  "Delete Test Task",
                  "Create a note called Ideas",
                  "Update Ideas",
                  "Delete Ideas",
                  "Schedule a meeting called Test Meeting tomorrow at 3 PM",
                  "Move Test Meeting to 4 PM",
                  "Delete Test Meeting",
                ].map(
                  (question) => (
                    <div
                      key={question}
                      className="exos-chip"
                      onClick={() =>
                        send(question)
                      }
                    >
                      {question}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {messages.map(
            (
              message,
              index
            ) => (
              <div
                key={index}
                className={
                  "exos-bubble " +
                  (message.role ===
                  "user"
                    ? "user"
                    : "ai")
                }
              >
                {message.content}
              </div>
            )
          )}

          {busy && (
            <div className="exos-bubble ai">
              <div className="exos-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        <div className="exos-chat-input-row">
          <input
            className="exos-input"
            placeholder="Ask ExecutiveOS anything..."
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                send();
              }
            }}
          />

          <button
            className="exos-btn-primary"
            onClick={() =>
              send()
            }
            disabled={busy}
          >
            <Send size={14} />
            {busy
              ? "Thinking..."
              : "Send"}
          </button>
        </div>
      </div>
    </>
  );
}