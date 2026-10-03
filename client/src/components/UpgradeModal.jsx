import React, { useState } from "react";

const EXECUTIVE_FEATURES = [
  "AI Email Copilot",
  "Meeting Intelligence",
  "Voice Assistant",
  "Advanced AI",
];

// Controlled from Premium.jsx: pass `open`, `onClose`, and `onConfirm`
// (onConfirm should call the `upgrade()` helper from PremiumContext).
export default function UpgradeModal({ open, onClose, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    setConfirmed(true);
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <div className="exos-upgrade-modal-overlay" onClick={handleClose}>
      <div className="exos-upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {!confirmed ? (
          <>
            <div className="exos-upgrade-modal-icon">✨</div>
            <h2 className="exos-upgrade-modal-title">Executive+</h2>
            <p className="exos-upgrade-modal-sub">Unlock your full workspace</p>
            <div className="exos-upgrade-modal-price">₹499 / month</div>
            <ul className="exos-upgrade-modal-features">
              {EXECUTIVE_FEATURES.map((f) => (
                <li key={f}>
                  <span>✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="exos-upgrade-modal-confirm" onClick={handleConfirm}>
              Upgrade Now
            </button>
            <button className="exos-upgrade-modal-later" onClick={handleClose}>
              Maybe later
            </button>
          </>
        ) : (
          <div className="exos-upgrade-modal-success">
            <div className="exos-upgrade-modal-icon">🎉</div>
            <h2 className="exos-upgrade-modal-title">You're now Executive+</h2>
            <p className="exos-upgrade-modal-sub">
              All premium features have been unlocked.
            </p>
            <button className="exos-upgrade-modal-confirm" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}