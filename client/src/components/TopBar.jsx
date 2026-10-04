import React, { useMemo, useRef, useState, useEffect } from "react";
import { Search, Bell, Sun, Moon, X, Menu } from "lucide-react";
import { useApp } from "../context/AppContext";
import { todayISO, formatNiceDate} from "../utils/date";
import ProfileModal from "./ProfileModal";

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

export default function TopBar({ goto, onMenuClick }) {
  const { data, patch } = useApp();
  const isDark = data.theme === "dark";
  const initials = (data.user.name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  useOutsideClose(searchRef, () => setSearchOpen(false));
  useOutsideClose(notifRef, () => setNotifOpen(false));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out = [];
    data.tasks.forEach((t) => t.title.toLowerCase().includes(q) &&
      out.push({ id: t.id, label: t.title, meta: `Task · ${t.priority}`, page: "tasks" }));
    data.events.forEach((e) => e.title.toLowerCase().includes(q) &&
      out.push({ id: e.id, label: e.title, meta: `Event · ${formatNiceDate(e.date)}`, page: "calendar" }));
    data.notes.forEach((n) => n.title.toLowerCase().includes(q) &&
      out.push({ id: n.id, label: n.title, meta: "Note", page: "notes" }));
    data.documents.forEach((d) => d.name.toLowerCase().includes(q) &&
      out.push({ id: d.id, label: d.name, meta: "Document", page: "documents" }));
    return out.slice(0, 8);
  }, [query, data]);

  const today = todayISO();
  const notifications = useMemo(() => {
    const list = [];
    data.events.filter((e) => e.date === today).forEach((e) =>
      list.push(`Today: ${e.title} at ${e.time}`));
    data.tasks.filter((t) => !t.completed && t.priority === "High").forEach((t) =>
      list.push(`High priority pending: ${t.title}`));
    return list.slice(0, 6);
  }, [data, today]);

  return (
    <div className="exos-topbar">
      <button
        className="exos-menu-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="exos-search-wrap" ref={searchRef}>
        <div className="exos-search" onClick={() => setSearchOpen(true)}>
          <Search size={15} />
          <input
            placeholder="Search anything..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
          />
          {query && (
            <button className="exos-search-clear" onClick={() => setQuery("")}>
              <X size={13} />
            </button>
          )}
        </div>
        {searchOpen && query.trim() && (
          <div className="exos-search-panel">
            {results.length === 0 && <div className="exos-search-empty">No matches for “{query}”.</div>}
            {results.map((r) => (
              <button
                key={r.page + r.id}
                className="exos-search-result"
                onClick={() => { goto && goto(r.page); setSearchOpen(false); setQuery(""); }}
              >
                <span>{r.label}</span>
                <span className="exos-search-meta">{r.meta}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="exos-topbar-right">
        <button
          className="exos-icon-btn"
          onClick={() => patch({ theme: isDark ? "light" : "dark" })}
          title="Toggle dark mode"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="exos-notif-wrap" ref={notifRef}>
          <button className="exos-icon-btn" onClick={() => setNotifOpen((v) => !v)}>
            <Bell size={17} />
            {notifications.length > 0 && <span className="exos-badge-dot">{notifications.length}</span>}
          </button>
          {notifOpen && (
            <div className="exos-notif-panel">
              <div className="exos-notif-title">Notifications</div>
              {notifications.length === 0 && <div className="exos-search-empty">You're all caught up.</div>}
              {notifications.map((n, i) => <div className="exos-notif-item" key={i}>{n}</div>)}
            </div>
          )}
        </div>

        <button
          className="exos-avatar"
          style={{ width: 38, height: 38, border: "none", cursor: "pointer", padding: 0, overflow: "hidden" }}
          onClick={() => setProfileOpen(true)}
          title="Your profile"
        >
          {data.user.avatar ? (
            <img
              src={data.user.avatar}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </button>
      </div>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}