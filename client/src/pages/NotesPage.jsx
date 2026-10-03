import React, { useState } from "react";
import { Plus, FileText, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { uid, todayISO, formatNiceDate } from "../utils/date";

export default function NotesPage() {
  const { data, patch } = useApp();
  const [activeId, setActiveId] = useState(data.notes[0]?.id || null);
  const active = data.notes.find((n) => n.id === activeId);

  const addNote = () => {
    const n = { id: uid(), title: "Untitled Note", content: "", updatedAt: todayISO() };
    patch({ notes: [n, ...data.notes] });
    setActiveId(n.id);
  };
  const updateNote = (id, fields) =>
    patch({ notes: data.notes.map((n) => (n.id === id ? { ...n, ...fields, updatedAt: todayISO() } : n)) });
  const removeNote = (id) => {
    patch({ notes: data.notes.filter((n) => n.id !== id) });
    if (activeId === id) setActiveId(null);
  };

  return (
    <>
      <div className="exos-page-title">Notes</div>
      <div className="exos-page-sub">{data.notes.length} notes</div>
      <div className="exos-notes-layout">
        <div className="exos-card exos-card-pad" style={{ maxHeight: 560, overflowY: "auto" }}>
          <button className="exos-btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 14 }} onClick={addNote}>
            <Plus size={14} /> New Note
          </button>
          {data.notes.map((n) => (
            <div key={n.id} className={"exos-note-tile" + (n.id === activeId ? " active" : "")} onClick={() => setActiveId(n.id)}>
              <div className="exos-note-tile-title">{n.title || "Untitled Note"}</div>
              <div className="exos-note-tile-snip">{n.content || "No content yet..."}</div>
              <div className="exos-note-tile-date">{n.updatedAt === todayISO() ? "Today" : formatNiceDate(n.updatedAt)}</div>
              <button className="exos-mini-btn danger exos-note-del" onClick={(e) => { e.stopPropagation(); removeNote(n.id); }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {data.notes.length === 0 && <div className="exos-empty-state">No notes yet.</div>}
        </div>
        <div className="exos-card exos-card-pad">
          {active ? (
            <>
              <input
                className="exos-note-editor-title" value={active.title} placeholder="Note title"
                onChange={(e) => updateNote(active.id, { title: e.target.value })}
              />
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 14 }}>
                Last edited {active.updatedAt === todayISO() ? "today" : formatNiceDate(active.updatedAt)}
              </div>
              <textarea
                className="exos-note-editor-body" value={active.content} placeholder="Start writing..."
                onChange={(e) => updateNote(active.id, { content: e.target.value })}
              />
            </>
          ) : (
            <div className="exos-note-empty"><FileText size={30} /> Select or create a note to start writing.</div>
          )}
        </div>
      </div>
    </>
  );
}
