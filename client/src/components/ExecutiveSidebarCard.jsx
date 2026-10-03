import React from "react";
import { useNavigate } from "react-router-dom";
import { usePremium } from "../context/PremiumContext";

// Drop this at the bottom of your sidebar, where the old static
// "Executive+ / Upgrade Now" block was. It hides itself once the
// user is already premium.
export default function ExecutiveSidebarCard() {
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  if (isPremium) return null;

  return (
    <div className="exos-upgrade">
      <div className="exos-upgrade-title">Executive+</div>
      <div className="exos-upgrade-text">
        Unlock all premium features and supercharge your productivity.
      </div>
      <button className="exos-upgrade-btn" onClick={() => navigate("/premium")}>
        Upgrade Now →
      </button>
    </div>
  );
}