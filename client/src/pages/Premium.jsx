import React, { useState } from "react";
import { usePremium } from "../context/PremiumContext";
import UpgradeModal from "../components/UpgradeModal";
// No separate CSS import — styles live in styles/global.css

const FREE_FEATURES = [
  "Dashboard",
  "Tasks",
  "Calendar",
  "Notes",
  "Documents",
  "Basic Finance",
  "AI Assistant",
];

const EXECUTIVE_FEATURES = [
  "Everything in Free",
  "AI Email Copilot",
  "Meeting Intelligence",
  "AI Meeting Summaries",
  "Smart Recommendations",
  "Reports",
  "Voice Assistant",
  "Advanced Finance",
];

// Full feature matrix for the comparison table underneath the cards.
const COMPARISON_ROWS = [
  { label: "Dashboard", free: true, executive: true },
  { label: "Tasks", free: true, executive: true },
  { label: "Calendar", free: true, executive: true },
  { label: "Notes", free: true, executive: true },
  { label: "Documents", free: true, executive: true },
  { label: "Basic Finance", free: true, executive: true },
  { label: "AI Assistant", free: true, executive: true },
  { label: "AI Email Copilot", free: false, executive: true },
  { label: "Meeting Intelligence", free: false, executive: true },
  { label: "AI Meeting Summaries", free: false, executive: true },
  { label: "Smart Recommendations", free: false, executive: true },
  { label: "Reports", free: false, executive: true },
  { label: "Voice Assistant", free: false, executive: true },
  { label: "Advanced Finance", free: false, executive: true },
];

const WHY_ITEMS = [
  { icon: "📊", label: "Reports" },
  { icon: "🎙", label: "Voice Assistant" },
  { icon: "📧", label: "Email Copilot" },
  { icon: "🧠", label: "Meeting Intelligence" },
];

export default function Premium({ goto }) {
  const { isPremium, upgrade } = usePremium();
  const [modalOpen, setModalOpen] = useState(false);

  const handleContinueFree = () => {
    goto("dashboard");
  };

  const handleUpgrade = () => {
    setModalOpen(true);
  };

  return (
    <div className="exos-premium-page">
      <div className="exos-premium-hero">
        <h1 className="exos-premium-title">Unlock Executive+</h1>
        <p className="exos-premium-subtitle">
          Work smarter with your personal AI workspace
        </p>
      </div>

      <div className="exos-premium-plans">
        <div className="exos-plan-card exos-plan-free">
          <div className="exos-plan-name">Free</div>
          <div className="exos-plan-price">
            ₹0<span className="exos-plan-period">/month</span>
          </div>
          <ul className="exos-plan-features">
            {FREE_FEATURES.map((f) => (
              <li key={f}>
                <span className="exos-plan-check">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button className="exos-plan-btn exos-plan-btn-ghost" onClick={handleContinueFree}>
            {isPremium ? "Continue with Free" : "Current Plan"}
          </button>
        </div>

        <div className="exos-plan-card exos-plan-executive">
          <span className="exos-popular-badge">MOST POPULAR</span>
          <div className="exos-plan-name">Executive+</div>
          <div className="exos-plan-price">
            ₹499<span className="exos-plan-period">/month</span>
          </div>
          <ul className="exos-plan-features">
            {EXECUTIVE_FEATURES.map((f) => (
              <li key={f}>
                <span className="exos-plan-check">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <button
            className={
              "exos-plan-btn " +
              (isPremium ? "exos-plan-btn-current" : "exos-plan-btn-upgrade")
            }
            onClick={handleUpgrade}
            disabled={isPremium}
          >
            {isPremium ? "Current Plan" : "Upgrade to Executive+"}
          </button>
        </div>
      </div>

      <div className="exos-premium-why">
        <h2 className="exos-premium-section-title">Why Executive+?</h2>
        <div className="exos-why-grid">
          {WHY_ITEMS.map((item) => (
            <div className="exos-why-item" key={item.label}>
              <span className="exos-why-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="exos-premium-compare">
        <h2 className="exos-premium-section-title">Compare plans</h2>
        <div className="exos-compare-table">
          <div className="exos-compare-row exos-compare-head">
            <div className="exos-compare-feature">Feature</div>
            <div className="exos-compare-col">Free</div>
            <div className="exos-compare-col exos-compare-col-executive">Executive+</div>
          </div>
          {COMPARISON_ROWS.map((row) => (
            <div className="exos-compare-row" key={row.label}>
              <div className="exos-compare-feature">{row.label}</div>
              <div className="exos-compare-col">{row.free ? "✓" : "—"}</div>
              <div className="exos-compare-col exos-compare-col-executive">
                {row.executive ? "✓" : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={upgrade}
      />
    </div>
  );
}