import React, { useEffect, useState } from "react";
import { User, Mail, Lock, Moon, Sun, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function AuthGate() {
  const { error, login, signup } = useAuth();
  const { data, patch } = useApp();
  const theme = data.theme || "light";

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (document.getElementById("exos-auth-fonts")) return;
    const link = document.createElement("link");
    link.id = "exos-auth-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  const toggleTheme = () => patch({ theme: theme === "light" ? "dark" : "light" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="exos-auth-shell" data-theme={theme}>
      <style>{`
        .exos-auth-shell {
          --bg-page:      #f5e8d8;
          --bg-card:      #fffdf9;
          --bg-input:     #fbf3e7;
          --bg-panel:     #4a0e1a;
          --bg-panel-2:   #6b1a2a;
          --maroon:       #7a1f2e;
          --maroon-dark:  #5c1220;
          --gold:         #c9a876;
          --gold-soft:    #e8d3ac;
          --text-1:       #2b1810;
          --text-2:       #8b7355;
          --border:       #e5d3bc;
          --danger-bg:    #fbe4e4;
          --danger-text:  #9a2f2f;
          --shadow:       0 24px 60px -20px rgba(74, 14, 26, 0.35);

          min-height: 100vh;
          width: 100%;
          display: flex;
          background: var(--bg-page);
          font-family: "Inter", sans-serif;
          transition: background 0.35s ease;
          position: relative;
        }

        .exos-auth-shell[data-theme="dark"] {
          --bg-page:      #170a0d;
          --bg-card:      #241014;
          --bg-input:     #1d0d10;
          --bg-panel:     #0f0608;
          --bg-panel-2:   #3a0f1a;
          --maroon:       #c04a5e;
          --maroon-dark:  #8f2c3d;
          --gold:         #d9ba84;
          --gold-soft:    #f0ddb6;
          --text-1:       #f3e7db;
          --text-2:       #b39a85;
          --border:       #3a2027;
          --danger-bg:    #3a1418;
          --danger-text:  #ea9a9a;
          --shadow:       0 24px 60px -20px rgba(0, 0, 0, 0.6);
        }

        .exos-auth-panel {
          flex: 0 0 50%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 52px;
          background:
            radial-gradient(circle at 20% 15%, rgba(201,168,118,0.16), transparent 45%),
            linear-gradient(160deg, var(--bg-panel) 0%, var(--bg-panel-2) 100%);
          color: var(--gold-soft);
          overflow: hidden;
        }

        .exos-auth-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(115deg, rgba(201,168,118,0.05) 0px, rgba(201,168,118,0.05) 1px, transparent 1px, transparent 64px);
          pointer-events: none;
        }

        .exos-auth-seal {
          width: 76px;
          height: 76px;
          border-radius: 999px;
          border: 1.5px solid rgba(201,168,118,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .exos-auth-seal::before {
          content: "";
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(201,168,118,0.3);
          border-radius: 999px;
        }
        .exos-auth-seal span {
          font-family: "Fraunces", serif;
          font-size: 26px;
          font-weight: 600;
          color: var(--gold);
        }

        .exos-auth-eyebrow {
          font-family: "Inter", sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(232, 211, 172, 0.6);
          margin: 0 0 18px;
        }

        .exos-auth-panel-heading {
          font-family: "Fraunces", serif;
          font-style: italic;
          font-weight: 500;
          font-size: 34px;
          line-height: 1.25;
          margin: 0 0 16px;
          color: #fdf6ea;
          max-width: 420px;
        }

        .exos-auth-panel-sub {
          font-size: 14.5px;
          line-height: 1.7;
          color: rgba(232, 211, 172, 0.72);
          max-width: 380px;
          margin: 0;
        }

        .exos-auth-panel-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: rgba(232, 211, 172, 0.5);
        }
        .exos-auth-panel-footer .divider {
          width: 22px;
          height: 1px;
          background: rgba(201,168,118,0.4);
        }

        .exos-auth-formside {
          flex: 0 0 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 28px;
          position: relative;
        }

        .exos-auth-theme-toggle {
          position: absolute;
          top: 28px;
          right: 32px;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .exos-auth-theme-toggle:hover { transform: translateY(-1px); }
        .exos-auth-theme-toggle:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }

        .exos-auth-card {
          width: 100%;
          max-width: 380px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px 36px 34px;
          box-shadow: var(--shadow);
        }

        .exos-auth-tabs {
          display: flex;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
        }
        .exos-auth-tab {
          flex: 1;
          border: none;
          background: transparent;
          padding: 9px 0;
          font-family: "Inter", sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-2);
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }
        .exos-auth-tab.active {
          background: var(--maroon);
          color: #fdf6ea;
          box-shadow: 0 6px 16px -6px rgba(122, 31, 46, 0.55);
        }
        .exos-auth-tab:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }

        .exos-auth-heading {
          font-family: "Fraunces", serif;
          font-weight: 600;
          font-size: 24px;
          color: var(--text-1);
          margin: 0 0 6px;
        }
        .exos-auth-subheading {
          font-size: 13.5px;
          color: var(--text-2);
          margin: 0 0 26px;
          line-height: 1.5;
        }

        .exos-auth-form { display: flex; flex-direction: column; gap: 16px; }
        .exos-auth-field { display: flex; flex-direction: column; gap: 6px; }

        .exos-auth-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: var(--text-1);
        }

        .exos-auth-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 11px;
          padding: 11px 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .exos-auth-input-wrap:focus-within {
          border-color: var(--maroon);
          box-shadow: 0 0 0 3px rgba(122, 31, 46, 0.14);
        }
        .exos-auth-input-wrap svg { color: var(--text-2); flex-shrink: 0; }

        .exos-auth-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: "Inter", sans-serif;
          font-size: 14px;
          color: var(--text-1);
          outline: none;
          min-width: 0;
        }
        .exos-auth-input::placeholder { color: var(--text-2); opacity: 0.75; }

        .exos-auth-eye-btn {
          background: none;
          border: none;
          padding: 0;
          display: flex;
          color: var(--text-2);
          cursor: pointer;
        }
        .exos-auth-eye-btn:focus-visible { outline: 2px solid var(--gold); border-radius: 4px; }

        .exos-auth-row-between {
          display: flex;
          justify-content: flex-end;
          margin-top: -6px;
        }
        .exos-auth-forgot {
          background: none;
          border: none;
          padding: 0;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--maroon);
          cursor: pointer;
        }

        .exos-auth-error {
          background: var(--danger-bg);
          color: var(--danger-text);
          font-size: 12.5px;
          font-weight: 500;
          padding: 10px 12px;
          border-radius: 9px;
        }

        .exos-auth-submit {
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 11px;
          padding: 12px 0;
          background: linear-gradient(135deg, var(--maroon) 0%, var(--maroon-dark) 100%);
          color: #fdf6ea;
          font-family: "Inter", sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 10px 22px -10px rgba(122, 31, 46, 0.6);
        }
        .exos-auth-submit:hover { transform: translateY(-1px); }
        .exos-auth-submit:active { transform: translateY(0); }
        .exos-auth-submit:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .exos-auth-submit svg { transition: transform 0.15s ease; }
        .exos-auth-submit:hover svg { transform: translateX(2px); }
        .exos-auth-submit:disabled { opacity: 0.65; cursor: default; transform: none; }

        .exos-auth-switch {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: var(--text-2);
        }
        .exos-auth-switch button {
          background: none;
          border: none;
          padding: 0;
          margin-left: 4px;
          font-weight: 700;
          color: var(--maroon);
          cursor: pointer;
        }
        .exos-auth-switch button:focus-visible { outline: 2px solid var(--gold); border-radius: 3px; }

        @media (max-width: 880px) {
          .exos-auth-panel { display: none; }
          .exos-auth-formside { padding: 64px 20px; flex: 1; }
        }
      `}</style>

      <div className="exos-auth-panel">
        <div>
          <div className="exos-auth-seal"><span>E</span></div>
        </div>

        <div>
          <p className="exos-auth-eyebrow">ExecutiveOS · Workspace</p>
          <h1 className="exos-auth-panel-heading">
            Run your day the way you run everything else &mdash; deliberately.
          </h1>
          <p className="exos-auth-panel-sub">
            Calendar, tasks, notes and your AI assistant, held in one place built for people who don't waste a minute.
          </p>
        </div>

        <div className="exos-auth-panel-footer">
          <span className="divider" />
          Trusted by focused operators everywhere
        </div>
      </div>

      <div className="exos-auth-formside">
        <button
          type="button"
          className="exos-auth-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        <div className="exos-auth-card">
          <div className="exos-auth-tabs">
            <button
              type="button"
              className={"exos-auth-tab" + (mode === "login" ? " active" : "")}
              onClick={() => setMode("login")}
            >
              Log In
            </button>
            <button
              type="button"
              className={"exos-auth-tab" + (mode === "signup" ? " active" : "")}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <h2 className="exos-auth-heading">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="exos-auth-subheading">
            {mode === "login"
              ? "Log in to get back to your workspace."
              : "Start your free ExecutiveOS workspace."}
          </p>

          <form className="exos-auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="exos-auth-field">
                <label className="exos-auth-label">Full name</label>
                <div className="exos-auth-input-wrap">
                  <User size={16} />
                  <input
                    className="exos-auth-input"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="exos-auth-field">
              <label className="exos-auth-label">Email</label>
              <div className="exos-auth-input-wrap">
                <Mail size={16} />
                <input
                  className="exos-auth-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="exos-auth-field">
              <label className="exos-auth-label">Password</label>
              <div className="exos-auth-input-wrap">
                <Lock size={16} />
                <input
                  className="exos-auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="exos-auth-eye-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="exos-auth-row-between">
                <button type="button" className="exos-auth-forgot">Forgot password?</button>
              </div>
            )}

            {error && <div className="exos-auth-error">{error}</div>}

            <button type="submit" className="exos-auth-submit" disabled={submitting}>
              {submitting
                ? "Please wait…"
                : mode === "login"
                ? "Log In"
                : "Sign Up"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="exos-auth-switch">
            {mode === "login" ? (
              <>
                Not registered yet?
                <button type="button" onClick={() => setMode("signup")}>Sign Up</button>
              </>
            ) : (
              <>
                Already have an account?
                <button type="button" onClick={() => setMode("login")}>Log In</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}