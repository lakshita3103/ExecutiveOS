import { uid, toISODate } from "../utils/date";
import { CATEGORY_LIST } from "../constants";

export function seedData() {
  const today = new Date();
  const iso = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return toISODate(d);
  };
  return {
    theme: "light",
    user: { name: "Lakshita", plan: "Pro Plan", avatar: null },
    focusTaskId: null,
    assistantMessages: [],
    tasks: [
      { id: uid(), title: "Finish DSA Sheet", priority: "High", completed: false, dueDate: iso(0), createdAt: iso(-1), subtasks: [
        { id: uid(), text: "Arrays & Strings", done: true },
        { id: uid(), text: "Linked Lists", done: true },
        { id: uid(), text: "Trees", done: true },
        { id: uid(), text: "Graphs", done: false },
        { id: uid(), text: "Dynamic Programming", done: false },
      ] },
      { id: uid(), title: "Read System Design Notes", priority: "Medium", completed: false, dueDate: iso(2), createdAt: iso(-2), subtasks: [] },
      { id: uid(), title: "Prepare PPT for Review", priority: "Medium", completed: false, dueDate: iso(1), createdAt: iso(-1), subtasks: [] },
      { id: uid(), title: "Update Resume", priority: "Low", completed: true, dueDate: null, createdAt: iso(-5), subtasks: [] },
      { id: uid(), title: "Reply to unread emails", priority: "Low", completed: false, dueDate: null, createdAt: iso(-5), subtasks: [] },
    ],
    events: [
    { id: uid(), date: iso(0), startTime: "10:00", endTime: "10:45", title: "Team Standup", location: "Google Meet", link: "https://meet.google.com/abc-defg-hij", color: "#6B3FA0", reminder: 10 },
    { id: uid(), date: iso(0), startTime: "12:00", endTime: "13:00", title: "Lunch Break", location: "", link: "", color: "#9B6FD1", reminder: 0 },
    { id: uid(), date: iso(0), startTime: "16:00", endTime: "17:00", title: "Product Review", location: "Meeting Room B", link: "", color: "#7B5EA7", reminder: 15 },
    { id: uid(), date: iso(0), startTime: "18:30", endTime: "20:00", title: "LeetCode Practice", location: "Focus Time", link: "", color: "#8A6BAE", reminder: 0 },
    { id: uid(), date: iso(1), startTime: "10:00", endTime: "11:00", title: "Client Meeting", location: "Google Meet", link: "https://meet.google.com/xyz-uvwx-rst", color: "#6B3FA0", reminder: 10 },
    { id: uid(), date: iso(3), startTime: "14:00", endTime: "15:00", title: "Design Review", location: "Zoom", link: "", color: "#7B5EA7", reminder: 0 },
  ],
    notes: [
      { id: uid(), title: "System Design — Key Ideas", content: "Load balancing, caching layers, database sharding. Review CAP theorem before the interview.", updatedAt: iso(-1) },
      { id: uid(), title: "Client Meeting Prep", content: "Walk through Q3 roadmap, confirm budget, share updated timeline deck.", updatedAt: iso(0) },
    ],
    documents: [
      { id: uid(), name: "DAA Assignment.pdf", type: "pdf", sizeKB: 2400, updatedAt: iso(0), dataUrl: null },
      { id: uid(), name: "Executive Summary.docx", type: "docx", sizeKB: 1100, updatedAt: iso(-1), dataUrl: null },
      { id: uid(), name: "Project Deck.pptx", type: "pptx", sizeKB: 5700, updatedAt: iso(-2), dataUrl: null },
      { id: uid(), name: "UI Explorations.fig", type: "fig", sizeKB: 12400, updatedAt: iso(-3), dataUrl: null },
    ],
    transactions: [
      { id: uid(), category: CATEGORY_LIST[0], amount: 8650, date: iso(-2) },
      { id: uid(), category: CATEGORY_LIST[1], amount: 4320, date: iso(-4) },
      { id: uid(), category: CATEGORY_LIST[2], amount: 6230, date: iso(-6) },
      { id: uid(), category: CATEGORY_LIST[3], amount: 5360, date: iso(-1) },
    ],
  };
}

/**
 * What every new account starts with: no demo tasks, no demo notes, no
 * demo anything. Used on signup, and as the fallback if a returning
 * user's saved data can't be found/parsed for some reason.
 */
export function emptyData() {
  return {
    theme: "light",
    user: { name: "", plan: "Free Plan", avatar: null },
    focusTaskId: null,
    assistantMessages: [],
    tasks: [],
    events: [],
    notes: [],
    documents: [],
    transactions: [],
  };
}