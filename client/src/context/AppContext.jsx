import React, {
  createContext, useContext, useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const AppCtx = createContext(null);

// Only used to remember the theme toggle on the login/signup screen,
// before anyone is signed in and there's a real workspace to save it to.
const ANON_THEME_KEY = "executiveos-theme-v1";

function readAnonTheme() {
  try {
    return localStorage.getItem(ANON_THEME_KEY) || "light";
  } catch {
    return "light";
  }
}

function placeholderWorkspace() {
  return {
    theme: "light",
    focusTaskId: null,
    assistantMessages: [],
    tasks: [],
    events: [],
    notes: [],
    documents: [],
    transactions: [],
  };
}

/**
 * Single source of truth for the signed-in user's workspace. Every page
 * reads from and writes to this same `data` object via `patch()` — same
 * interface as before, but the tasks/events/notes/etc. it holds now live
 * in MongoDB (fetched/saved through the server) instead of localStorage.
 *
 * `data.user` (name/email/avatar/plan) is composed from the authenticated
 * identity in AuthContext, not stored in the workspace itself — that way
 * a profile update (name/email/avatar) only has to happen in one place.
 */
export function AppProvider({ children }) {
  const { user: authUser, loading: authLoading } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [anonTheme, setAnonTheme] = useState(readAnonTheme);
  const loaded = useRef(false);

  // (Re)load whenever the signed-in account changes: login, signup,
  // switching accounts, or logout (back to nothing).
  useEffect(() => {
    let cancelled = false;

    if (!authUser) {
      setWorkspace(null);
      loaded.current = false;
      return undefined;
    }

    loaded.current = false;

    api
      .get("/api/workspace")
      .then((data) => {
        if (!cancelled) setWorkspace(data);
      })
      .catch(() => {
        if (!cancelled) setWorkspace(placeholderWorkspace());
      })
      .finally(() => {
        if (!cancelled) loaded.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  // Persist to the server on every change (debounced so rapid edits — e.g.
  // typing in a note — don't fire a request per keystroke).
  useEffect(() => {
    if (!authUser || !workspace || !loaded.current) return undefined;
    const t = setTimeout(() => {
      api.put("/api/workspace", workspace).catch(() => {
        // Best-effort: a dropped save here isn't fatal — the next change
        // will attempt to save the (by-then more current) state again.
      });
    }, 400);
    return () => clearTimeout(t);
  }, [workspace, authUser]);

  const patch = useCallback(
    (fieldsOrUpdater) => {
      if (!authUser) {
        // Logged out: the only thing worth persisting is the theme toggle
        // on the auth screen itself.
        const base = { ...placeholderWorkspace(), theme: anonTheme };
        const fields =
          typeof fieldsOrUpdater === "function"
            ? fieldsOrUpdater(base)
            : fieldsOrUpdater;
        if (fields && fields.theme) {
          setAnonTheme(fields.theme);
          try {
            localStorage.setItem(ANON_THEME_KEY, fields.theme);
          } catch {
            // non-fatal — theme just won't be remembered pre-login
          }
        }
        return;
      }

      setWorkspace((prev) => {
        const prevFull = { ...placeholderWorkspace(), ...prev };
        const fields =
          typeof fieldsOrUpdater === "function"
            ? fieldsOrUpdater(prevFull)
            : fieldsOrUpdater;
        // `user` (name/email/avatar/plan) isn't a workspace field — it's
        // sourced from AuthContext. Drop it defensively if passed in, so
        // stray old call sites can't silently no-op into the wrong place.
        const { user: _ignored, ...rest } = fields || {};
        return { ...prev, ...rest };
      });
    },
    [authUser, anonTheme]
  );

  const resetToEmpty = useCallback(() => {
    patch(placeholderWorkspace());
  }, [patch]);

  const data = useMemo(() => {
    const base = authUser
      ? { ...placeholderWorkspace(), ...workspace }
      : { ...placeholderWorkspace(), theme: anonTheme };

    return {
      ...base,
      user: authUser
        ? {
            name: authUser.name,
            email: authUser.email,
            avatar: authUser.avatar,
            plan: authUser.plan,
          }
        : { name: "", email: "", avatar: null, plan: "free" },
    };
  }, [authUser, workspace, anonTheme]);

  const stillCheckingSession = authLoading;
  const stillLoadingWorkspace = Boolean(authUser) && workspace === null;

  if (stillCheckingSession || stillLoadingWorkspace) {
    return (
      <div className="exos-splash">
        <div className="exos-splash-badge">E</div>
        <div>Loading ExecutiveOS…</div>
      </div>
    );
  }

  return (
    <AppCtx.Provider value={{ data, patch, resetToEmpty }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}