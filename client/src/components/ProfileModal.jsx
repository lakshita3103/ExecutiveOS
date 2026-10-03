import React, { useRef, useState } from "react";
import { X, Camera, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024; // 1.5MB, plenty for a small avatar

// Controlled from TopBar.jsx (or anywhere else): pass `open` and `onClose`.
export default function ProfileModal({ open, onClose }) {
  const { user, error, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!open) return null;

  const initials = (name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const resetSensitiveFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    resetSensitiveFields();
    setLocalError("");
    setSuccess("");
    onClose();
  };

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    setLocalError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setLocalError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setLocalError("That image is too large — please pick one under 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setUploadingPhoto(true);
      const ok = await updateProfile({ avatar: reader.result });
      setUploadingPhoto(false);
      if (ok) setSuccess("Photo updated.");
    };
    reader.onerror = () => setLocalError("Couldn't read that image. Try another.");
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    const ok = await updateProfile({ avatar: null });
    setUploadingPhoto(false);
    if (ok) setSuccess("Photo removed.");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setLocalError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setLocalError("New passwords don't match.");
        return;
      }
    }

    setSaving(true);
    const ok = await updateProfile({
      name,
      email,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });
    setSaving(false);

    if (ok) {
      resetSensitiveFields();
      setSuccess("Profile updated.");
    }
  };

  const shownError = localError || error;

  return (
    <div className="exos-profile-modal-overlay" onClick={handleClose}>
      <div
        className="exos-profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          .exos-profile-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(20, 10, 8, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }
          .exos-profile-modal {
            width: 100%;
            max-width: 420px;
            max-height: 90vh;
            overflow-y: auto;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            padding: 28px 26px 24px;
          }
          .exos-pm-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .exos-pm-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
          }
          .exos-pm-close {
            width: 32px;
            height: 32px;
            border-radius: 9px;
            border: 1px solid var(--card-border);
            background: var(--bg);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .exos-pm-close:hover { color: var(--accent); }

          .exos-pm-avatar-row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 22px;
          }
          .exos-pm-avatar {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background: linear-gradient(135deg,#C9636B,#482616);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 22px;
            color: #fff;
            flex-shrink: 0;
            overflow: hidden;
          }
          .exos-pm-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .exos-pm-avatar-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .exos-pm-avatar-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid var(--card-border);
            background: var(--bg);
            color: var(--text-primary);
            font-size: 12.5px;
            font-weight: 600;
            padding: 7px 12px;
            border-radius: 9px;
            cursor: pointer;
          }
          .exos-pm-avatar-btn:hover { border-color: var(--accent); color: var(--accent); }
          .exos-pm-avatar-btn.danger { color: var(--danger); }
          .exos-pm-avatar-btn.danger:hover { border-color: var(--danger); }

          .exos-pm-section-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--text-tertiary);
            margin: 18px 0 10px;
          }
          .exos-pm-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
          .exos-pm-label { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
          .exos-pm-input {
            border: 1px solid var(--card-border);
            background: var(--input-bg);
            color: var(--text-primary);
            border-radius: 10px;
            padding: 10px 12px;
            font-size: 13.5px;
            outline: none;
            width: 100%;
          }
          .exos-pm-input:focus { border-color: var(--accent); }
          .exos-pm-hint { font-size: 11.5px; color: var(--text-tertiary); margin: -4px 0 4px; }

          .exos-pm-message {
            font-size: 12.5px;
            font-weight: 500;
            padding: 9px 11px;
            border-radius: 9px;
            margin: 4px 0 14px;
          }
          .exos-pm-message.error { background: var(--danger-soft); color: var(--danger); }
          .exos-pm-message.success { background: var(--success-soft); color: var(--success); }

          .exos-pm-actions {
            display: flex;
            gap: 10px;
            margin-top: 18px;
          }
          .exos-pm-save {
            flex: 1;
            border: none;
            border-radius: 11px;
            padding: 11px 0;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
            color: #fdf6ea;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
          }
          .exos-pm-save:disabled { opacity: 0.6; cursor: default; }
          .exos-pm-cancel {
            border: 1px solid var(--card-border);
            background: var(--bg);
            color: var(--text-secondary);
            border-radius: 11px;
            padding: 11px 18px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>

        <div className="exos-pm-header">
          <h2 className="exos-pm-title">Your Profile</h2>
          <button className="exos-pm-close" onClick={handleClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="exos-pm-avatar-row">
          <div className="exos-pm-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" />
            ) : (
              initials
            )}
          </div>
          <div className="exos-pm-avatar-actions">
            <button
              type="button"
              className="exos-pm-avatar-btn"
              onClick={handlePickPhoto}
              disabled={uploadingPhoto}
            >
              <Camera size={13} /> {uploadingPhoto ? "Uploading…" : "Change photo"}
            </button>
            {user.avatar && (
              <button
                type="button"
                className="exos-pm-avatar-btn danger"
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
              >
                <Trash2 size={13} /> Remove photo
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="exos-pm-field">
            <label className="exos-pm-label">Display name</label>
            <input
              className="exos-pm-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="exos-pm-field">
            <label className="exos-pm-label">Email address</label>
            <input
              className="exos-pm-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="exos-pm-section-label">Change password</div>
          <p className="exos-pm-hint">Leave the new password fields blank to keep your current one.</p>

          <div className="exos-pm-field">
            <label className="exos-pm-label">New password</label>
            <input
              className="exos-pm-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              minLength={6}
            />
          </div>

          <div className="exos-pm-field">
            <label className="exos-pm-label">Confirm new password</label>
            <input
              className="exos-pm-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              minLength={6}
            />
          </div>

          <div className="exos-pm-field">
            <label className="exos-pm-label">Current password</label>
            <input
              className="exos-pm-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to change email or password"
            />
          </div>

          {shownError && <div className="exos-pm-message error">{shownError}</div>}
          {!shownError && success && (
            <div className="exos-pm-message success">{success}</div>
          )}

          <div className="exos-pm-actions">
            <button type="submit" className="exos-pm-save" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" className="exos-pm-cancel" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}