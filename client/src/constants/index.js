import {
  LayoutDashboard, Calendar as CalendarIcon, CheckSquare, FileText, FolderOpen,
  Wallet, Bot, Mail, Video, FileSpreadsheet, Mic,
} from "lucide-react";

// Legacy global key — no longer written to, kept only so old data doesn't
// vanish silently if you want to migrate it manually.
export const STORAGE_KEY = "executiveos-data-v1";

// Used to remember theme (light/dark) on the login/signup screen, before
// we know which account is signing in.
export const THEME_KEY = "executiveos-theme-v1";

// Every signed-in account gets its own isolated data — this is the fix
// for "new signups see the previous user's tasks/notes". Never share this
// key across accounts.
export function userDataKey(email) {
  return `executiveos-data-v1:${String(email).trim().toLowerCase()}`;
}
export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
export const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { key: "calendar", label: "Calendar", icon: CalendarIcon, path: "/calendar" },
  { key: "tasks", label: "Tasks", icon: CheckSquare, path: "/tasks" },
  { key: "notes", label: "Notes", icon: FileText, path: "/notes" },
  { key: "documents", label: "Documents", icon: FolderOpen, path: "/documents" },
  { key: "finance", label: "Finance", icon: Wallet, path: "/finance" },
  { key: "assistant", label: "AI Assistant", icon: Bot, path: "/assistant" },
];

export const PREMIUM_ITEMS = [
  {
    key: "ai-email",
    label: "AI Email Copilot",
    icon: Mail,
  },
  {
    key: "meeting-intelligence",
    label: "Meeting Intelligence",
    icon: Video,
  },
  {
    key: "reports",
    label: "Reports",
    icon: FileText,
  },
  {
    key: "voice-assistant",
    label: "Voice Assistant",
    icon: Mic,
  },
];
export const PRIORITIES = ["Low", "Medium", "High"];

export const CATEGORY_COLORS = {
  "Food & Dining": "#6B3FA0",
  "Transport": "#7B5EA7",
  "Shopping": "#9B6FD1",
  "Others": "#4B2E6B",
  "Bills": "#C9A6E0",
  "Health": "#8A6BAE",
};
export const CATEGORY_LIST = Object.keys(CATEGORY_COLORS);
