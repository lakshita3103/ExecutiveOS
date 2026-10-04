import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { PremiumProvider } from "./context/PremiumContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NAV_ITEMS } from "./constants";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";
import NotesPage from "./pages/NotesPage";
import DocumentsPage from "./pages/DocumentsPage";
import FinancePage from "./pages/FinancePage";
import AIAssistant from "./pages/AIAssistant";
import Premium from "./pages/Premium";

import AIEmailCopilot from "./pages/AIEmailCopilot";
import MeetingIntelligence from "./pages/MeetingIntelligence";
import ReportsPage from "./pages/ReportsPage";
import VoiceAssistant from "./pages/VoiceAssistant";

import AuthGate from "./pages/AuthGate";

/* -------------------------------------------------------
   PREMIUM ROUTES
------------------------------------------------------- */

const PREMIUM_ROUTES = [
  "ai-email",
  "meeting-intelligence",
  "reports",
  "voice-assistant",
];

/* -------------------------------------------------------
   ROUTE / HASH HELPER
------------------------------------------------------- */

function pageFromHash() {
  const hash = window.location.hash
    .replace("#/", "")
    .replace("#", "");

  if (hash === "premium") {
    return "premium";
  }

  if (PREMIUM_ROUTES.includes(hash)) {
    return hash;
  }

  return NAV_ITEMS.some((n) => n.key === hash)
    ? hash
    : "dashboard";
}

/* -------------------------------------------------------
   MAIN APP SHELL
------------------------------------------------------- */

function Shell() {
  const { data } = useApp();

  const [page, setPage] = useState(pageFromHash());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Listen for browser/hash navigation */
  useEffect(() => {
    const onHash = () => {
      setPage(pageFromHash());
    };

    window.addEventListener("hashchange", onHash);

    return () => {
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  /* Central navigation function */
  const goto = (key) => {
    window.location.hash =
      key === "dashboard"
        ? "/"
        : `/${key}`;

    setPage(key);
    setSidebarOpen(false); // close the mobile drawer on any navigation
  };

  /* -------------------------------------------------------
     PAGE ROUTES
  ------------------------------------------------------- */

  const PageComponent = {
  dashboard: Dashboard,
  calendar: CalendarPage,
  tasks: TasksPage,
  notes: NotesPage,
  documents: DocumentsPage,
  finance: FinancePage,

  // Free
  assistant: AIAssistant,

  // Premium
  premium: Premium,
  "ai-email": AIEmailCopilot,
  "meeting-intelligence": MeetingIntelligence,
  reports: ReportsPage,
  voice: VoiceAssistant,
  "voice-assistant": VoiceAssistant,
}[page] || Dashboard;

  return (
    <div className={"exos-root theme-" + data.theme}>
      <div className="exos-shell">

        <Sidebar
          page={page}
          goto={goto}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="exos-main">

          <TopBar
            goto={goto}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <div className="exos-content">
            <PageComponent
              goto={goto}
            />
          </div>

        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------------
   AUTH + PREMIUM PROVIDERS
------------------------------------------------------- */

function Root() {
  const { user } = useAuth();

  /*
   * Not logged in → authentication page.
   */
  if (!user) {
    return <AuthGate />;
  }

  /*
   * Logged in → ExecutiveOS
   */
  return (
    <PremiumProvider>
      <Shell />
    </PremiumProvider>
  );
}

/* -------------------------------------------------------
   ROOT
------------------------------------------------------- */

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </AuthProvider>
  );
}