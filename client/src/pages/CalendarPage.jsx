import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw, Plus, MapPin, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { MONTH_NAMES, DAY_NAMES } from "../constants";
import { uid, pad, todayISO, formatFullDate } from "../utils/date";

export default function CalendarPage() {
  const { data, patch } = useApp();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(todayISO());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", time: "10:00 AM", location: "", duration: "1h" });

  const first = new Date(viewYear, viewMonth, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: daysInPrevMonth - startWeekday + 1 + i, other: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, other: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length, other: true, next: true });

  const isoFor = (day) => `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
  const eventsByDate = (iso) => data.events.filter((e) => e.date === iso).sort((a, b) => a.time.localeCompare(b.time));
  const selectedEvents = eventsByDate(selected);

  const prevMonth = () => { let m = viewMonth - 1, y = viewYear; if (m < 0) { m = 11; y--; } setViewMonth(m); setViewYear(y); };
  const nextMonth = () => { let m = viewMonth + 1, y = viewYear; if (m > 11) { m = 0; y++; } setViewMonth(m); setViewYear(y); };

  const addEvent = () => {
    if (!form.title.trim()) return;
    patch({
      events: [...data.events, {
        id: uid(), date: selected, time: form.time, title: form.title.trim(),
        location: form.location, duration: form.duration, color: "#6B3FA0",
      }],
    });
    setForm({ title: "", time: "10:00 AM", location: "", duration: "1h" });
    setAdding(false);
  };
  const removeEvent = (id) => patch({ events: data.events.filter((e) => e.id !== id) });

  return (
    <>
      <div className="exos-page-title">Calendar</div>
      <div className="exos-page-sub">{MONTH_NAMES[viewMonth]} {viewYear} · Selected: {formatFullDate(selected)}</div>
      <div className="exos-grid-2">
        <div className="exos-card exos-card-pad">
          <div className="exos-card-header">
            <div className="exos-card-title">{MONTH_NAMES[viewMonth]} {viewYear}</div>
            <div className="exos-cal-nav">
              <button onClick={prevMonth}><ChevronLeft size={14} /></button>
              <button
                className="exos-mini-btn"
                onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); setSelected(todayISO()); }}
                title="Jump to today"
              >
                <RotateCcw size={14} />
              </button>
              <button onClick={nextMonth}><ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="exos-week-strip">
            {DAY_NAMES.map((d) => <div className="dname" key={d}>{d}</div>)}
          </div>
          <div className="exos-week-strip" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", rowGap: 4 }}>
            {cells.map((c, i) => {
              const iso = c.other ? null : isoFor(c.day);
              const isToday = iso === todayISO();
              const isSelected = iso === selected;
              const hasEvents = iso && eventsByDate(iso).length > 0;
              return (
                <div
                  key={i}
                  className={"exos-daycell" + (c.other ? " other-month" : "") + (isToday ? " today" : "") + (isSelected ? " selected" : "")}
                  onClick={() => !c.other && setSelected(iso)}
                >
                  {c.day}
                  {hasEvents && !isSelected && <span className="dot" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="exos-card exos-card-pad">
          <div className="exos-card-header">
            <div className="exos-card-title"><CalendarIcon size={16} color="var(--accent)" /> {formatFullDate(selected)}</div>
          </div>
          {selectedEvents.length === 0 && <div className="exos-empty-state">No events on this day.</div>}
          {selectedEvents.map((ev) => (
            <div className="exos-event-item" key={ev.id}>
              <div className="exos-event-dot" style={{ background: ev.color }} />
              <div style={{ flex: 1 }}>
                <div className="exos-event-when">{ev.time} · {ev.duration}</div>
                <div className="exos-event-title">{ev.title}</div>
                {ev.location && <div className="exos-event-sub"><MapPin size={11} /> {ev.location}</div>}
              </div>
              <button className="exos-mini-btn danger" onClick={() => removeEvent(ev.id)}><Trash2 size={14} /></button>
            </div>
          ))}
          {adding ? (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <input className="exos-input" placeholder="Event title" autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <input className="exos-input" placeholder="Time e.g. 10:00 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                <input className="exos-input" placeholder="Duration e.g. 1h" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <input className="exos-input" placeholder="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="exos-btn-primary" onClick={addEvent}><Plus size={14} /> Add Event</button>
                <button className="exos-btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="exos-add-link" onClick={() => setAdding(true)}><Plus size={14} /> Add new event</button>
          )}
        </div>
      </div>
    </>
  );
}
