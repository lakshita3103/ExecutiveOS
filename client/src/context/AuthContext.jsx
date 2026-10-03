import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // `user` is { id, name, email, avatar, plan } or null.
  const [user, setUser] = useState(null);
  // True until we've checked whether an existing session cookie is still
  // valid — the app shouldn't flash the login screen while that's pending.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/auth/me")
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        // No valid session — that's a normal, expected outcome here, not
        // an error to surface to the person.
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // SIGN UP
  // =========================
  const signup = useCallback(async (name, email, password) => {
    setError("");
    try {
      const data = await api.post("/api/auth/signup", {
        name,
        email,
        password,
      });
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = useCallback(async (email, password) => {
    setError("");
    try {
      const data = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // =========================
  // LOGOUT
  // =========================
  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Even if the network call fails, clear the local session so the
      // person isn't stuck unable to log out.
    }
    setUser(null);
  }, []);

  // =========================
  // UPDATE PROFILE
  // (name, email, avatar, and/or password)
  // =========================
  const updateProfile = useCallback(
    async ({ name, email, avatar, currentPassword, newPassword }) => {
      setError("");
      try {
        const data = await api.patch("/api/auth/profile", {
          name,
          email,
          avatar,
          currentPassword,
          newPassword,
        });
        setUser(data.user);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      }
    },
    []
  );

  // =========================
  // UPGRADE / DOWNGRADE PLAN
  // (used by PremiumContext)
  // =========================
  const upgradePlan = useCallback(async () => {
    const data = await api.post("/api/auth/upgrade");
    setUser(data.user);
  }, []);

  const downgradePlan = useCallback(async () => {
    const data = await api.post("/api/auth/downgrade");
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateProfile,
        upgradePlan,
        downgradePlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
}