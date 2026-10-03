export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
export function pad(n) { return String(n).padStart(2, "0"); }
export function toISODate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
export function todayISO() { return toISODate(new Date()); }

import { MONTH_NAMES } from "../constants";

export function formatNiceDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}
export function formatFullDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
export function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}
// "Your Daily Brief — Monday, August 3"
export function formatWeekdayDate(iso) {
  const d = new Date(iso + "T00:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  return `${weekday}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

// Parses "4:00 PM" style event times and, only for events happening today,
// returns how many minutes from now until the event starts (negative if
// already passed). Returns null for anything not happening today, since
// "in 2 hours" only makes sense relative to the current moment.
export function minutesUntilEvent(dateISO, timeStr) {
  if (dateISO !== todayISO()) return null;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let [, h, m, ap] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (ap.toUpperCase() === "PM" && h !== 12) h += 12;
  if (ap.toUpperCase() === "AM" && h === 12) h = 0;
  const now = new Date();
  const eventTime = new Date();
  eventTime.setHours(h, m, 0, 0);
  return Math.round((eventTime - now) / 60000);
}

export function formatDuration(minutes) {
  const abs = Math.abs(minutes);
  if (abs < 60) return `${abs} minute${abs === 1 ? "" : "s"}`;
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${h} hour${h === 1 ? "" : "s"}${m ? ` ${m} min` : ""}`;
}

// Whole days between a stored date and today — used to flag tasks that
// have been sitting untouched for a while ("hasn't been updated in 5 days").
export function daysSince(iso) {
  if (!iso) return 0;
  const then = new Date(iso + "T00:00:00");
  const now = new Date(todayISO() + "T00:00:00");
  return Math.round((now - then) / 86400000);
}