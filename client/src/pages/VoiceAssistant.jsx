import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  RotateCcw,
  Send,
  CheckCircle2,
  Radio,
  Square,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { uid, todayISO } from "../utils/date";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

/* =========================================================
   DATE HELPERS
========================================================= */

function dateFromOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function normalizeDate(value) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const lower = String(value).toLowerCase().trim();

  if (lower === "today") {
    return todayISO();
  }

  if (lower === "tomorrow") {
    return dateFromOffset(1);
  }

  if (lower === "day after tomorrow") {
    return dateFromOffset(2);
  }

  return value;
}

/* =========================================================
   FIND EXISTING ITEMS
========================================================= */

function findTask(data, query) {
  if (!query) return null;

  const search = String(query).toLowerCase().trim();

  const exact = data.tasks.find(
    (task) =>
      String(task.title || "").toLowerCase().trim() === search
  );

  if (exact) return exact;

  return data.tasks.find((task) => {
    const title = String(task.title || "").toLowerCase();

    return (
      title.includes(search) ||
      search.includes(title)
    );
  });
}

function findEvent(data, query) {
  if (!query) return null;

  const search = String(query).toLowerCase().trim();

  const exact = data.events.find(
    (event) =>
      String(event.title || "").toLowerCase().trim() === search
  );

  if (exact) return exact;

  return data.events.find((event) => {
    const title = String(event.title || "").toLowerCase();

    return (
      title.includes(search) ||
      search.includes(title)
    );
  });
}

function findNote(data, query) {
  if (!query) return null;

  const search = String(query).toLowerCase().trim();

  const exact = data.notes.find(
    (note) =>
      String(note.title || "").toLowerCase().trim() === search
  );

  if (exact) return exact;

  return data.notes.find((note) => {
    const title = String(note.title || "").toLowerCase();

    return (
      title.includes(search) ||
      search.includes(title)
    );
  });
}

/* =========================================================
   EXECUTE AI ACTION
========================================================= */

function executeAction(action, data, patch) {
  if (!action || !action.action) {
    return {
      success: false,
      message:
        "I understood your request, but I couldn't determine the action.",
    };
  }

  const type = action.action;

  /* -------------------------------------------------------
     CREATE TASK
  ------------------------------------------------------- */

  if (type === "create_task") {
    const taskData = action.task || action;

    const title =
      taskData.title?.trim();

    if (!title) {
      return {
        success: false,
        message: "I need a task name to create the task.",
      };
    }

    const task = {
      id: uid(),
      title,

      priority:
        ["High", "Medium", "Low"].includes(
          taskData.priority
        )
          ? taskData.priority
          : "Medium",

      completed: false,

      dueDate:
        normalizeDate(taskData.dueDate) || null,

      createdAt: todayISO(),

      subtasks: [],
    };

    patch({
      tasks: [...data.tasks, task],
    });

    return {
      success: true,
      message: `Done — I created the task "${task.title}".`,
    };
  }

  /* -------------------------------------------------------
     UPDATE TASK
  ------------------------------------------------------- */

  if (type === "update_task") {
    const query =
      action.taskQuery ||
      action.targetTitle ||
      action.title;

    const task = findTask(data, query);

    if (!task) {
      return {
        success: false,
        message: `I couldn't find a task called "${query || "that"}".`,
      };
    }

    const changes = action.changes || action;

    const updatedTask = {
      ...task,

      ...(changes.title
        ? {
            title: changes.title.trim(),
          }
        : {}),

      ...(changes.priority
        ? {
            priority: changes.priority,
          }
        : {}),

      ...(changes.dueDate !== undefined
        ? {
            dueDate: normalizeDate(
              changes.dueDate
            ),
          }
        : {}),

      ...(changes.completed !== undefined
        ? {
            completed: Boolean(
              changes.completed
            ),
          }
        : {}),
    };

    patch({
      tasks: data.tasks.map((t) =>
        t.id === task.id
          ? updatedTask
          : t
      ),
    });

    return {
      success: true,
      message: `Done — I updated "${task.title}".`,
    };
  }

  /* -------------------------------------------------------
     COMPLETE TASK
  ------------------------------------------------------- */

  if (type === "complete_task") {
    const query =
      action.taskQuery ||
      action.targetTitle ||
      action.title;

    const task = findTask(data, query);

    if (!task) {
      return {
        success: false,
        message: `I couldn't find that task.`,
      };
    }

    patch({
      tasks: data.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: true,
            }
          : t
      ),
    });

    return {
      success: true,
      message: `Done — "${task.title}" is marked as completed.`,
    };
  }

  /* -------------------------------------------------------
     DELETE TASK
  ------------------------------------------------------- */

  if (type === "delete_task") {
    const query =
      action.taskQuery ||
      action.targetTitle ||
      action.title;

    const task = findTask(data, query);

    if (!task) {
      return {
        success: false,
        message: `I couldn't find that task.`,
      };
    }

    patch({
      tasks: data.tasks.filter(
        (t) => t.id !== task.id
      ),

      focusTaskId:
        data.focusTaskId === task.id
          ? null
          : data.focusTaskId,
    });

    return {
      success: true,
      message: `Done — I deleted "${task.title}".`,
    };
  }

  /* -------------------------------------------------------
     SET FOCUS
  ------------------------------------------------------- */

  if (type === "set_focus") {
    const query =
      action.taskQuery ||
      action.targetTitle ||
      action.title;

    const task = findTask(data, query);

    if (!task) {
      return {
        success: false,
        message: `I couldn't find that task.`,
      };
    }

    patch({
      focusTaskId: task.id,
    });

    return {
      success: true,
      message: `Done — "${task.title}" is now your focus.`,
    };
  }

  /* -------------------------------------------------------
     CREATE EVENT
  ------------------------------------------------------- */

  if (type === "create_event") {
    const eventData =
      action.event || action;

    const title =
      eventData.title?.trim();

    if (!title) {
      return {
        success: false,
        message:
          "I need a meeting or event name.",
      };
    }

    if (!eventData.date) {
      return {
        success: false,
        message:
          "I need a date for the meeting.",
      };
    }

    if (!eventData.time) {
      return {
        success: false,
        message:
          "I need a time for the meeting.",
      };
    }

    const event = {
      id: uid(),

      date:
        normalizeDate(eventData.date),

      time:
        eventData.time,

      title,

      location:
        eventData.location || "",

      duration:
        eventData.duration || "1h",

      color: "#6B3FA0",

      link:
        eventData.link || "",

      reminder:
        eventData.reminder !== undefined
          ? Number(eventData.reminder)
          : 10,
    };

    patch({
      events: [
        ...data.events,
        event,
      ],
    });

    return {
      success: true,
      message: `Done — I scheduled "${event.title}" for ${event.date} at ${event.time}.`,
    };
  }

  /* -------------------------------------------------------
     UPDATE EVENT
  ------------------------------------------------------- */

  if (type === "update_event") {
    const query =
      action.eventQuery ||
      action.targetTitle ||
      action.title;

    const event = findEvent(
      data,
      query
    );

    if (!event) {
      return {
        success: false,
        message:
          "I couldn't find that meeting or event.",
      };
    }

    const changes =
      action.changes || action;

    const updatedEvent = {
      ...event,

      ...(changes.title
        ? {
            title:
              changes.title.trim(),
          }
        : {}),

      ...(changes.date
        ? {
            date:
              normalizeDate(
                changes.date
              ),
          }
        : {}),

      ...(changes.time
        ? {
            time: changes.time,
          }
        : {}),

      ...(changes.location !== undefined
        ? {
            location:
              changes.location,
          }
        : {}),

      ...(changes.duration
        ? {
            duration:
              changes.duration,
          }
        : {}),
    };

    patch({
      events: data.events.map(
        (e) =>
          e.id === event.id
            ? updatedEvent
            : e
      ),
    });

    return {
      success: true,
      message: `Done — I updated "${event.title}".`,
    };
  }

  /* -------------------------------------------------------
     DELETE EVENT
  ------------------------------------------------------- */

  if (type === "delete_event") {
    const query =
      action.eventQuery ||
      action.targetTitle ||
      action.title;

    const event = findEvent(
      data,
      query
    );

    if (!event) {
      return {
        success: false,
        message:
          "I couldn't find that meeting or event.",
      };
    }

    patch({
      events: data.events.filter(
        (e) => e.id !== event.id
      ),
    });

    return {
      success: true,
      message: `Done — I deleted "${event.title}".`,
    };
  }

  /* -------------------------------------------------------
     CREATE NOTE
  ------------------------------------------------------- */

  if (type === "create_note") {
    const noteData =
      action.note || action;

    const title =
      noteData.title?.trim() ||
      "Untitled Note";

    const note = {
      id: uid(),

      title,

      content:
        noteData.content || "",

      updatedAt:
        todayISO(),
    };

    patch({
      notes: [
        note,
        ...data.notes,
      ],
    });

    return {
      success: true,
      message: `Done — I created the note "${title}".`,
    };
  }

  /* -------------------------------------------------------
     UPDATE NOTE
  ------------------------------------------------------- */

  if (type === "update_note") {
    const query =
      action.noteQuery ||
      action.targetTitle ||
      action.title;

    const note = findNote(
      data,
      query
    );

    if (!note) {
      return {
        success: false,
        message:
          "I couldn't find that note.",
      };
    }

    const changes =
      action.changes || action;

    const updatedNote = {
      ...note,

      ...(changes.title
        ? {
            title:
              changes.title.trim(),
          }
        : {}),

      ...(changes.content !== undefined
        ? {
            content:
              changes.content,
          }
        : {}),

      updatedAt:
        todayISO(),
    };

    patch({
      notes: data.notes.map(
        (n) =>
          n.id === note.id
            ? updatedNote
            : n
      ),
    });

    return {
      success: true,
      message: `Done — I updated "${note.title}".`,
    };
  }

  /* -------------------------------------------------------
     DELETE NOTE
  ------------------------------------------------------- */

  if (type === "delete_note") {
    const query =
      action.noteQuery ||
      action.targetTitle ||
      action.title;

    const note = findNote(
      data,
      query
    );

    if (!note) {
      return {
        success: false,
        message:
          "I couldn't find that note.",
      };
    }

    patch({
      notes: data.notes.filter(
        (n) => n.id !== note.id
      ),
    });

    return {
      success: true,
      message: `Done — I deleted "${note.title}".`,
    };
  }

  /* -------------------------------------------------------
     NORMAL RESPONSE
  ------------------------------------------------------- */

  return {
    success: true,

    message:
      action.message ||
      action.response ||
      "Done.",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function VoiceAssistant() {
  const { data, patch } = useApp();

  const [listening, setListening] =
    useState(false);

  const [handsFree, setHandsFree] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [transcript, setTranscript] =
    useState("");

  const [status, setStatus] =
    useState("Ready when you are");

  const [aiResponse, setAiResponse] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [supported, setSupported] =
    useState(true);

  const recognitionRef =
    useRef(null);

  const handsFreeRef =
    useRef(false);

  const speakingRef =
    useRef(false);

  const restartingRef =
    useRef(false);

  const silenceTimerRef =
    useRef(null);

  const restartTimerRef =
    useRef(null);

  const finalTranscriptRef =
    useRef("");

  /* =======================================================
     KEEP HANDS-FREE REF SYNCHRONIZED
  ======================================================= */

  useEffect(() => {
    handsFreeRef.current =
      handsFree;
  }, [handsFree]);

  /* =======================================================
     FIND A GOOD MALE VOICE
  ======================================================= */

  const getPreferredVoice = () => {
    if (
      !("speechSynthesis" in window)
    ) {
      return null;
    }

    const voices =
      window.speechSynthesis.getVoices();

    if (!voices.length) {
      return null;
    }

    /*
      Browser voice names differ between
      Chrome, Edge, Windows and macOS.

      We prefer voices that are commonly
      lower/deeper sounding.
    */

    const preferredNames = [
      "Google UK English Male",
      "Google US English",
      "Microsoft Ryan Online",
      "Microsoft Guy Online",
      "Microsoft Guy",
      "Microsoft David",
      "Microsoft Mark",
      "Alex",
      "Daniel",
      "Arthur",
      "Oliver",
      "James",
    ];

    for (const name of preferredNames) {
      const found =
        voices.find((voice) =>
          voice.name
            .toLowerCase()
            .includes(
              name.toLowerCase()
            )
        );

      if (found) {
        return found;
      }
    }

    const englishMaleLike =
      voices.find((voice) => {
        const name =
          voice.name.toLowerCase();

        return (
          /male|guy|david|daniel|alex|mark|ryan|arthur|oliver|james/.test(
            name
          ) &&
          /^en(-|_)/i.test(
            voice.lang
          )
        );
      });

    if (englishMaleLike) {
      return englishMaleLike;
    }

    return (
      voices.find(
        (voice) =>
          /^en(-|_)/i.test(
            voice.lang
          )
      ) || voices[0]
    );
  };

  /* =======================================================
     STOP SPEECH
  ======================================================= */

  const stopSpeaking = () => {
    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    speakingRef.current = false;
    setSpeaking(false);
  };

  /* =======================================================
     START LISTENING
  ======================================================= */

  const startListening = () => {
    if (
      !recognitionRef.current ||
      speakingRef.current
    ) {
      return;
    }

    if (restartingRef.current) {
      return;
    }

    /*
      Every new listening session starts
      with a clean command.
    */

    finalTranscriptRef.current =
      "";

    setTranscript("");
    setAiResponse("");

    try {
      recognitionRef.current.start();
    } catch (error) {
      /*
        Browser throws if recognition is
        already running. That's okay.
      */
      console.log(
        "Recognition start:",
        error?.message
      );
    }
  };

  /* =======================================================
     STOP LISTENING
  ======================================================= */

  const stopListening = () => {
    if (
      !recognitionRef.current
    ) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {}

    setListening(false);
  };

  /* =======================================================
     RESTART HANDS-FREE LISTENING
  ======================================================= */

  const restartHandsFreeListening = (
    delay = 700
  ) => {
    if (
      !handsFreeRef.current ||
      speakingRef.current
    ) {
      return;
    }

    clearTimeout(
      restartTimerRef.current
    );

    restartTimerRef.current =
      setTimeout(() => {
        if (
          !handsFreeRef.current ||
          speakingRef.current
        ) {
          return;
        }

        restartingRef.current =
          false;

        finalTranscriptRef.current =
          "";

        setTranscript("");

        setStatus(
          "Listening..."
        );

        try {
          recognitionRef.current?.start();
        } catch (error) {
          console.log(
            "Hands-free restart:",
            error?.message
          );

          /*
            If the browser still considers
            recognition active, retry shortly.
          */

          restartingRef.current =
            true;

          restartHandsFreeListening(
            900
          );
        }
      }, delay);
  };

  /* =======================================================
     SPEAK RESPONSE
  ======================================================= */

  const speakResponse = (
    text,
    resumeHandsFree = handsFreeRef.current
  ) => {
    if (!text) {
      if (resumeHandsFree) {
        restartHandsFreeListening(
          500
        );
      }

      return;
    }

    if (
      !("speechSynthesis" in window)
    ) {
      if (resumeHandsFree) {
        restartHandsFreeListening(
          500
        );
      }

      return;
    }

    /*
      CRITICAL FIX:
      Stop recognition BEFORE speech starts.

      This prevents the microphone from
      hearing the assistant's own voice.
    */

    try {
      recognitionRef.current?.stop();
    } catch {}

    setListening(false);

    speakingRef.current = true;
    setSpeaking(true);

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    const voice =
      getPreferredVoice();

    if (voice) {
      speech.voice = voice;
    }

    /*
      Lower pitch + slightly slower rate
      gives a deeper, more natural sound.

      Browser voices themselves determine
      most of the actual voice character.
    */

    speech.rate = 0.92;
    speech.pitch = 0.78;
    speech.volume = 1;

    speech.onstart = () => {
      speakingRef.current = true;
      setSpeaking(true);
      setStatus(
        "ExecutiveOS is speaking..."
      );
    };

    speech.onend = () => {
      speakingRef.current = false;
      setSpeaking(false);

      /*
        Give the browser a moment after TTS
        finishes before opening the mic.

        This is important because some browsers
        continue outputting a tiny audio tail.
      */

      if (
        resumeHandsFree &&
        handsFreeRef.current
      ) {
        setStatus(
          "Listening for your next command..."
        );

        restartHandsFreeListening(
          900
        );
      } else {
        setStatus(
          "Ready when you are"
        );
      }
    };

    speech.onerror = (event) => {
      console.error(
        "Speech synthesis error:",
        event
      );

      speakingRef.current = false;
      setSpeaking(false);

      if (
        resumeHandsFree &&
        handsFreeRef.current
      ) {
        restartHandsFreeListening(
          900
        );
      } else {
        setStatus(
          "Ready when you are"
        );
      }
    };

    window.speechSynthesis.speak(
      speech
    );
  };

  /* =======================================================
     INITIALIZE SPEECH RECOGNITION
  ======================================================= */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;

    /*
      We need interim results so the UI
      feels responsive.
    */

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognition.maxAlternatives = 1;

    /* -----------------------------------------------------
       START
    ----------------------------------------------------- */

    recognition.onstart = () => {
      /*
        Never allow recognition while TTS
        is active.
      */

      if (speakingRef.current) {
        try {
          recognition.stop();
        } catch {}

        return;
      }

      restartingRef.current =
        false;

      setListening(true);

      setStatus(
        handsFreeRef.current
          ? "Listening..."
          : "Listening..."
      );
    };

    /* -----------------------------------------------------
       RESULT
    ----------------------------------------------------- */

    recognition.onresult = (
      event
    ) => {
      /*
        ABSOLUTE SAFETY CHECK:
        Ignore anything the browser gives us
        while the assistant is speaking.
      */

      if (speakingRef.current) {
        return;
      }

      let text = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        text +=
          event.results[i][0]
            .transcript;
      }

      text = text.trim();

      if (!text) return;

      setTranscript(text);

      /*
        Save transcript outside React state
        so the hands-free timeout always has
        the newest value.
      */

      finalTranscriptRef.current =
        text;

      /*
        When the user stops speaking,
        automatically send the command.

        We use a small debounce because speech
        recognition may emit several result events.
      */

      clearTimeout(
        silenceTimerRef.current
      );

      silenceTimerRef.current =
        setTimeout(() => {
          if (
            speakingRef.current
          ) {
            return;
          }

          const command =
            finalTranscriptRef.current.trim();

          if (!command) {
            return;
          }

          /*
            Stop listening immediately.
            This guarantees the microphone
            is not open while AI responds.
          */

          try {
            recognition.stop();
          } catch {}

          setListening(false);

          sendToAI(
            command,
            handsFreeRef.current
          );
        }, 750);
    };

    /* -----------------------------------------------------
       END
    ----------------------------------------------------- */

    recognition.onend = () => {
      setListening(false);

      /*
        Do NOT automatically restart here.

        We only restart after TTS finishes.

        This is the critical difference from
        the old hands-free behavior.
      */

      if (
        speakingRef.current
      ) {
        return;
      }

      if (
        loading
      ) {
        return;
      }

      /*
        If we have a transcript but it wasn't
        sent yet, send it.

        Normally the silence timer handles this.
      */

      const command =
        finalTranscriptRef.current.trim();

      if (
        command &&
        !speakingRef.current
      ) {
        clearTimeout(
          silenceTimerRef.current
        );

        sendToAI(
          command,
          handsFreeRef.current
        );

        return;
      }

      if (
        handsFreeRef.current
      ) {
        /*
          Only restart if we are genuinely
          waiting for user speech.
        */

        restartHandsFreeListening(
          700
        );

        return;
      }

      setStatus(
        "Ready when you are"
      );
    };

    /* -----------------------------------------------------
       ERROR
    ----------------------------------------------------- */

    recognition.onerror = (
      event
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);

      /*
        "aborted" commonly occurs when
        recognition is intentionally stopped
        before TTS.

        It is NOT a real error.
      */

      if (
        event.error ===
        "aborted"
      ) {
        if (
          handsFreeRef.current &&
          !speakingRef.current
        ) {
          restartHandsFreeListening(
            700
          );
        }

        return;
      }

      if (
        event.error ===
        "no-speech"
      ) {
        setStatus(
          "I didn't hear anything."
        );

        if (
          handsFreeRef.current &&
          !speakingRef.current
        ) {
          restartHandsFreeListening(
            700
          );
        }

        return;
      }

      if (
        event.error ===
        "not-allowed"
      ) {
        setStatus(
          "Microphone permission is required."
        );

        setHandsFree(false);

        return;
      }

      setStatus(
        "Something went wrong. Try again."
      );
    };

    recognitionRef.current =
      recognition;

    /*
      Load voices.
    */

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.onvoiceschanged =
        () => {
          window.speechSynthesis.getVoices();
        };
    }

    return () => {
      clearTimeout(
        silenceTimerRef.current
      );

      clearTimeout(
        restartTimerRef.current
      );

      try {
        recognition.stop();
      } catch {}

      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =======================================================
     SEND COMMAND TO AI
  ======================================================= */

  const sendToAI = async (
    text = transcript,
    resumeHandsFree = handsFreeRef.current
  ) => {
    const command =
      String(text || "").trim();

    if (!command) {
      setStatus(
        "Please say something first."
      );
      return;
    }

    /*
      Make absolutely sure microphone
      is closed before contacting AI.
    */

    try {
      recognitionRef.current?.stop();
    } catch {}

    setListening(false);

    clearTimeout(
      silenceTimerRef.current
    );

    finalTranscriptRef.current =
      "";

    setLoading(true);

    setStatus(
      "ExecutiveOS is thinking..."
    );

    setAiResponse("");

    try {
      const response =
        await fetch(
          `${API_URL}/api/assistant`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              mode: "action",

              command,

              today:
                todayISO(),

              /*
                Your server expects messages/context,
                but we also send the voice-specific
                fields so this works with the current
                endpoint.
              */

              messages: [
                {
                  role: "user",
                  content: command,
                },
              ],

              context: JSON.stringify({
                tasks:
                  data.tasks,

                events:
                  data.events,

                notes:
                  data.notes,
              }),

              data: {
                tasks:
                  data.tasks,

                events:
                  data.events,

                notes:
                  data.notes,
              },
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const result =
        await response.json();

      /*
        Your server returns:

        {
          action: "create_task",
          task: {...},
          message: "..."
        }

        OR some versions may return:

        {
          action: {
            action: "create_task",
            task: {...}
          }
        }

        Support both.
      */

      let aiAction = result;

      if (
        result.action &&
        typeof result.action ===
          "object"
      ) {
        aiAction =
          result.action;
      }

      /*
        If server returned "none",
        don't try to execute it as CRUD.
      */

      if (
        aiAction.action ===
        "none"
      ) {
        const message =
          aiAction.message ||
          result.message ||
          "I'm ready.";

        setAiResponse(
          message
        );

        setStatus(
          "Response ready"
        );

        speakResponse(
          message,
          resumeHandsFree
        );

        return;
      }

      if (
        !aiAction.action
      ) {
        /*
          Some normal AI responses may
          only contain message.
        */

        const message =
          result.message ||
          result.response ||
          "I understood you.";

        setAiResponse(
          message
        );

        setStatus(
          "Response ready"
        );

        speakResponse(
          message,
          resumeHandsFree
        );

        return;
      }

      /*
        Execute CRUD locally through
        AppContext.
      */

      const executed =
        executeAction(
          aiAction,
          data,
          patch
        );

      setAiResponse(
        executed.message
      );

      setStatus(
        executed.success
          ? "Action completed"
          : "I need a little more information"
      );

      /*
        Speak ONLY after microphone has
        been stopped.
      */

      speakResponse(
        executed.message,
        resumeHandsFree
      );
    } catch (error) {
      console.error(
        "ExecutiveOS AI connection error:",
        error
      );

      const message =
        "I couldn't process that command. Make sure the ExecutiveOS AI server is running on port 3001.";

      setStatus(
        "Connection error"
      );

      setAiResponse(
        message
      );

      speakResponse(
        message,
        resumeHandsFree
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     TOGGLE HANDS-FREE
  ======================================================= */

  const toggleHandsFree = () => {
    const next =
      !handsFree;

    setHandsFree(next);

    handsFreeRef.current =
      next;

    if (!next) {
      /*
        Turning hands-free OFF:
        stop microphone and speech.
      */

      clearTimeout(
        restartTimerRef.current
      );

      try {
        recognitionRef.current?.stop();
      } catch {}

      setListening(false);

      setStatus(
        "Hands-free mode off"
      );

      return;
    }

    /*
      Turning hands-free ON.
    */

    setTranscript("");
    setAiResponse("");

    finalTranscriptRef.current =
      "";

    setStatus(
      "Hands-free mode starting..."
    );

    /*
      Don't start while assistant is speaking.
    */

    if (
      speakingRef.current
    ) {
      setStatus(
        "Hands-free will resume after I finish speaking."
      );

      return;
    }

    restartHandsFreeListening(
      400
    );
  };

  /* =======================================================
     TEST VOICE
  ======================================================= */

  const speakExample = () => {
    speakResponse(
      "Hello. I'm your ExecutiveOS voice assistant. Tell me what you need.",
      false
    );
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const clearTranscript = () => {
    finalTranscriptRef.current =
      "";

    setTranscript("");

    setAiResponse("");

    setStatus(
      handsFree
        ? "Listening..."
        : "Ready when you are"
    );
  };

  /* =======================================================
     QUICK EXAMPLE
  ======================================================= */

  const useExample = (
    text
  ) => {
    setTranscript(text);

    finalTranscriptRef.current =
      text;

    setAiResponse("");

    setStatus(
      "Processing command..."
    );

    sendToAI(
      text,
      handsFreeRef.current
    );
  };

  /* =======================================================
     UNSUPPORTED
  ======================================================= */

  if (!supported) {
    return (
      <div className="voice-page">
        <div className="voice-not-supported">
          <MicOff size={28} />

          <h2>
            Voice recognition unavailable
          </h2>

          <p>
            Your current browser does
            not support speech recognition.
            Try Google Chrome or Microsoft
            Edge.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="voice-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="voice-page-header">

        <div>

          <div className="voice-eyebrow">
            <Sparkles size={14} />

            EXECUTIVEOS AI
          </div>

          <h1>
            Voice Assistant
          </h1>

          <p>
            Speak naturally and let
            ExecutiveOS take care of the
            details.
          </p>

        </div>

        <div
          className={`voice-status ${
            listening ||
            loading ||
            speaking
              ? "voice-status-active"
              : ""
          }`}
        >

          <span />

          {speaking
            ? "Speaking"
            : listening
            ? "Listening"
            : loading
            ? "Thinking"
            : handsFree
            ? "Hands-Free"
            : "Ready"}

        </div>

      </div>

      {/* ===================================================
          MAIN CARD
      =================================================== */}

      <div className="voice-main-card">

        <div className="voice-card-glow" />

        {/* -----------------------------------------------
            HANDS FREE CONTROL
        ----------------------------------------------- */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >

          <button
            type="button"
            onClick={
              toggleHandsFree
            }
            disabled={
              loading ||
              speaking
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              border: "1px solid var(--card-border)",
              background:
                handsFree
                  ? "var(--accent-soft)"
                  : "var(--card-bg)",
              color:
                handsFree
                  ? "var(--accent)"
                  : "var(--text-secondary)",
              borderRadius: 999,
              padding:
                "9px 16px",
              cursor:
                loading ||
                speaking
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 700,
              fontSize: 12,
              opacity:
                loading ||
                speaking
                  ? 0.65
                  : 1,
            }}
          >

            {handsFree ? (
              <Radio size={15} />
            ) : (
              <Mic size={15} />
            )}

            {handsFree
              ? "HANDS-FREE ON"
              : "ENABLE HANDS-FREE"}

          </button>

        </div>

        {/* -----------------------------------------------
            VOICE ORB
        ----------------------------------------------- */}

        <div
          className={`voice-orb ${
            listening
              ? "voice-orb-listening"
              : ""
          } ${
            speaking
              ? "voice-orb-speaking"
              : ""
          }`}
        >

          <div className="voice-orb-ring voice-ring-one" />

          <div className="voice-orb-ring voice-ring-two" />

          <button
            className="voice-mic-button"
            onClick={() => {

              if (
                speaking
              ) {
                stopSpeaking();

                if (
                  handsFreeRef.current
                ) {
                  restartHandsFreeListening(
                    500
                  );
                }

                return;
              }

              if (
                listening
              ) {
                stopListening();
              } else {
                startListening();
              }

            }}
            disabled={loading}
            aria-label={
              speaking
                ? "Stop speaking"
                : listening
                ? "Stop listening"
                : "Start listening"
            }
          >

            {speaking ? (
              <Square size={30} />
            ) : listening ? (
              <MicOff size={34} />
            ) : (
              <Mic size={34} />
            )}

          </button>

        </div>

        {/* -----------------------------------------------
            STATUS
        ----------------------------------------------- */}

        <div className="voice-status-text">

          {status}

        </div>

        <p className="voice-helper-text">

          {speaking
            ? "I'm speaking. Your microphone is paused so I won't hear my own voice."
            : listening
            ? handsFree
              ? "Hands-free is active. Speak naturally."
              : "Speak naturally. I'm listening."
            : loading
            ? "ExecutiveOS is processing your command."
            : handsFree
            ? "Hands-free is ready. I'll listen again after every response."
            : "Tap the microphone and tell me what you need."}

        </p>

        {/* -----------------------------------------------
            TRANSCRIPT
        ----------------------------------------------- */}

        <div
          className={`voice-transcript-box ${
            transcript
              ? "voice-transcript-visible"
              : ""
          }`}
        >

          <div className="voice-transcript-top">

            <span>
              YOUR COMMAND
            </span>

            {transcript && (
              <button
                onClick={
                  clearTranscript
                }
              >
                <RotateCcw size={14} />

                Clear
              </button>
            )}

          </div>

          <div className="voice-transcript-content">

            {transcript || (
              <span className="voice-placeholder">
                Your voice command will
                appear here...
              </span>
            )}

          </div>

        </div>

        {/* -----------------------------------------------
            AI RESPONSE
        ----------------------------------------------- */}

        {aiResponse && (
          <div
            className="voice-ai-response"
            style={{
              marginTop: 18,
              borderRadius: 18,
              border:
                "1px solid var(--card-border)",
              background:
                "var(--card-bg)",
              overflow: "hidden",
              boxShadow:
                "0 12px 35px rgba(0,0,0,0.08)",
            }}
          >

            <div
              className="voice-ai-response-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding:
                  "13px 15px",
                borderBottom:
                  "1px solid var(--card-border)",
              }}
            >

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 8,
                  color:
                    "var(--accent)",
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing:
                    "0.08em",
                }}
              >

                <CheckCircle2
                  size={15}
                />

                EXECUTIVEOS AI

              </div>

              <button
                onClick={() =>
                  speakResponse(
                    aiResponse,
                    false
                  )
                }
                title="Read response aloud"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius:
                    "50%",
                  border:
                    "1px solid var(--card-border)",
                  background:
                    "var(--card-bg)",
                  color:
                    "var(--accent)",
                  cursor:
                    "pointer",
                  display:
                    "grid",
                  placeItems:
                    "center",
                }}
              >

                <Volume2
                  size={17}
                />

              </button>

            </div>

            <div
              className="voice-ai-response-text"
              style={{
                padding:
                  "17px 16px",
                lineHeight: 1.65,
                fontSize: 14,
                color:
                  "var(--text-primary)",
              }}
            >

              {aiResponse}

            </div>

            {handsFree && (
              <div
                style={{
                  padding:
                    "10px 16px",
                  background:
                    "var(--accent-soft)",
                  color:
                    "var(--accent)",
                  fontSize: 11,
                  fontWeight: 700,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 7,
                }}
              >

                <Radio size={13} />

                Microphone paused while
                I speak — listening will
                resume automatically.

              </div>
            )}

          </div>
        )}

        {/* -----------------------------------------------
            ACTIONS
        ----------------------------------------------- */}

        <div className="voice-actions">

          <button
            className="voice-primary-button"
            onClick={() => {

              if (
                speaking
              ) {
                stopSpeaking();

                if (
                  handsFreeRef.current
                ) {
                  restartHandsFreeListening(
                    500
                  );
                }

                return;
              }

              if (
                listening
              ) {
                stopListening();
              } else if (
                transcript &&
                !loading
              ) {
                sendToAI(
                  transcript,
                  handsFreeRef.current
                );
              } else {
                startListening();
              }

            }}
            disabled={loading}
          >

            {loading ? (
              <>
                <Sparkles size={18} />

                Thinking...
              </>
            ) : speaking ? (
              <>
                <Square size={18} />

                Stop Speaking
              </>
            ) : listening ? (
              <>
                <MicOff size={18} />

                Stop Listening
              </>
            ) : transcript ? (
              <>
                <Send size={18} />

                Ask ExecutiveOS
              </>
            ) : (
              <>
                <Mic size={18} />

                Start Listening
              </>
            )}

          </button>

          <button
            className="voice-secondary-button"
            onClick={
              speakExample
            }
          >

            <Volume2 size={17} />

            Test Voice

          </button>

        </div>

      </div>

      {/* ===================================================
          QUICK EXAMPLES
      =================================================== */}

      <div className="voice-examples-section">

        <div className="voice-section-heading">

          <div>

            <span>
              QUICK EXAMPLES
            </span>

            <h2>
              Try saying something like
            </h2>

          </div>

        </div>

        <div className="voice-example-grid">

          {/* TASK */}

          <button
            className="voice-example-card"
            onClick={() =>
              useExample(
                "Create a high priority task to finish the DSA sheet tomorrow."
              )
            }
          >

            <div className="voice-example-icon">
              <Mic size={17} />
            </div>

            <div>

              <strong>
                Create a task
              </strong>

              <p>
                "Create a high priority
                task to finish the DSA
                sheet tomorrow."
              </p>

            </div>

          </button>

          {/* MEETING */}

          <button
            className="voice-example-card"
            onClick={() =>
              useExample(
                "Schedule a meeting tomorrow at 3 PM for one hour."
              )
            }
          >

            <div className="voice-example-icon">
              <Sparkles size={17} />
            </div>

            <div>

              <strong>
                Schedule a meeting
              </strong>

              <p>
                "Schedule a meeting
                tomorrow at 3 PM for
                one hour."
              </p>

            </div>

          </button>

          {/* NOTE */}

          <button
            className="voice-example-card"
            onClick={() =>
              useExample(
                "Create a note called Interview Ideas and write down that I should review system design."
              )
            }
          >

            <div className="voice-example-icon">
              <Volume2 size={17} />
            </div>

            <div>

              <strong>
                Create a note
              </strong>

              <p>
                "Create a note called
                Interview Ideas and write
                down that I should review
                system design."
              </p>

            </div>

          </button>

          {/* COMPLETE TASK */}

          <button
            className="voice-example-card"
            onClick={() =>
              useExample(
                "Mark Finish DSA Sheet as completed."
              )
            }
          >

            <div className="voice-example-icon">
              <CheckCircle2 size={17} />
            </div>

            <div>

              <strong>
                Complete a task
              </strong>

              <p>
                "Mark Finish DSA Sheet
                as completed."
              </p>

            </div>

          </button>

        </div>

      </div>

    </div>
  );
}