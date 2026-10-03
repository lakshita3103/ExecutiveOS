import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Trash2, Download, Edit3 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { uid, todayISO, formatNiceDate } from "../utils/date";
import { IconForDoc, colorForDoc } from "../utils/docIcons";

// Files smaller than this are read fully as base64 and kept in the document
// record, so they can be re-downloaded later. Bigger files are still added
// (name/size/date tracked) but only the metadata is stored — localStorage
// has a ~5MB total budget, so we don't want one big file to blow past it.
const MAX_STORED_BYTES = 1.5 * 1024 * 1024; // 1.5MB

function extOf(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "file";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocumentsPage() {
  const { data, patch } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // Handles one or more real files picked from the device (laptop, phone,
  // or PC — the browser's native file picker works the same on all three;
  // on phones it also offers "Take Photo" as an option automatically).
  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    const newDocs = [];
    for (const file of files) {
      let dataUrl = null;
      if (file.size <= MAX_STORED_BYTES) {
        try { dataUrl = await readFileAsDataUrl(file); } catch { dataUrl = null; }
      }
      newDocs.push({
        id: uid(),
        name: file.name,
        type: extOf(file.name),
        sizeKB: Math.max(1, Math.round(file.size / 1024)),
        updatedAt: todayISO(),
        dataUrl, // null means "too large to store a preview/download copy"
      });
    }
    patch({ documents: [...newDocs, ...data.documents] });
    setUploading(false);
  }, [data.documents, patch]);

  const onInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeDoc = (id) => patch({ documents: data.documents.filter((d) => d.id !== id) });

  const renameDoc = (id, currentName) => {
    const next = window.prompt("Rename file", currentName);
    if (next && next.trim() && next.trim() !== currentName) {
      patch({ documents: data.documents.map((d) => (d.id === id ? { ...d, name: next.trim(), type: extOf(next.trim()) } : d)) });
    }
  };

  const downloadDoc = (doc) => {
    if (!doc.dataUrl) return;
    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.name;
    a.click();
  };

  return (
    <>
      <div className="exos-page-title">Documents</div>
      <div className="exos-page-sub">{data.documents.length} files</div>

      <div
        className={"exos-dropzone" + (dragOver ? " active" : "")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={onInputChange}
        />
        <UploadCloud size={26} />
        <div className="exos-dropzone-title">
          {uploading ? "Uploading…" : "Drop files here, or click to upload"}
        </div>
        <div className="exos-dropzone-sub">Works from your laptop, phone, or PC file picker</div>
      </div>

      <div className="exos-card exos-card-pad">
        <div className="exos-doc-grid">
          {data.documents.map((doc) => {
            const Icon = IconForDoc(doc.type);
            return (
              <div key={doc.id} className="exos-doc-tile">
                <div className="exos-doc-actions">
                  {doc.dataUrl && (
                    <button className="exos-mini-btn" onClick={() => downloadDoc(doc)} title="Download"><Download size={13} /></button>
                  )}
                  <button className="exos-mini-btn" onClick={() => renameDoc(doc.id, doc.name)} title="Rename"><Edit3 size={13} /></button>
                  <button className="exos-mini-btn danger" onClick={() => removeDoc(doc.id)} title="Delete"><Trash2 size={13} /></button>
                </div>
                <div className="exos-doc-icon" style={{ background: colorForDoc(doc.type) }}><Icon size={17} /></div>
                <div className="exos-doc-name">{doc.name}</div>
                <div className="exos-doc-meta">
                  {(doc.sizeKB / 1024).toFixed(2)} MB · {doc.updatedAt === todayISO() ? "Today" : formatNiceDate(doc.updatedAt)}
                  {!doc.dataUrl && <> · no preview stored</>}
                </div>
              </div>
            );
          })}
          {data.documents.length === 0 && <div className="exos-empty-state">No documents yet — upload one above.</div>}
        </div>
      </div>
    </>
  );
}