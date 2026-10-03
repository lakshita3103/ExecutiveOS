import React from "react";
import { Crown, ArrowRight, LogOut } from "lucide-react";
import { NAV_ITEMS, PREMIUM_ITEMS } from "../constants";
import { useApp } from "../context/AppContext";
import { usePremium } from "../context/PremiumContext";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ page, goto }) {
  const { data } = useApp();
  const { isPremium } = usePremium();
  const { logout } = useAuth();

  const initials = (data.user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="exos-sidebar">

      {/* -------------------------------------------------------
         BRAND
      ------------------------------------------------------- */}

      <div className="exos-brand">
        <div className="exos-brand-icon">E</div>

        <div>
          <div className="exos-brand-title">
            ExecutiveOS
          </div>

          <div className="exos-brand-sub">
            Your Personal Executive AI
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------
         FREE NAVIGATION
      ------------------------------------------------------- */}

      <nav className="exos-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={
              "exos-nav-item" +
              (page === item.key ? " active" : "")
            }
            onClick={() => goto(item.key)}
          >
            <item.icon size={17} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* -------------------------------------------------------
         PREMIUM
      ------------------------------------------------------- */}

      <div className="exos-section-label">
        PREMIUM
      </div>

      <nav className="exos-nav">
        {PREMIUM_ITEMS.map((item) => (
          <button
            key={item.key}
            className={
              "exos-nav-item" +
              (page === item.key ? " active" : "") +
              (!isPremium ? " locked" : "")
            }
            title={
              isPremium
                ? item.label
                : "Upgrade to unlock"
            }
            onClick={() =>
              goto(
                isPremium
                  ? item.key
                  : "premium"
              )
            }
          >
            <item.icon size={17} />

            {item.label}

            {!isPremium && (
              <span className="exos-lock-badge">
                PRO
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* -------------------------------------------------------
         UPGRADE CARD
      ------------------------------------------------------- */}

      {!isPremium && (
        <div className="exos-upgrade">

          <div className="exos-upgrade-title">
            <Crown size={15} />
            Executive+
          </div>

          <div className="exos-upgrade-text">
            Unlock all premium features and
            supercharge your productivity.
          </div>

          <button
            className="exos-upgrade-btn"
            onClick={() => goto("premium")}
          >
            Upgrade Now
            <ArrowRight size={13} />
          </button>

        </div>
      )}

      {/* -------------------------------------------------------
         PROFILE
      ------------------------------------------------------- */}

      <div className="exos-profile">

        <div className="exos-avatar" style={{ overflow: "hidden" }}>
          {data.user.avatar ? (
            <img
              src={data.user.avatar}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>

        <div className="exos-profile-info">

          <div className="exos-profile-name">
            {data.user.name}
          </div>

          <div className="exos-profile-plan">
            {isPremium
              ? "Executive+"
              : "Free Plan"}
          </div>

        </div>

        <button
          className="exos-profile-logout"
          onClick={logout}
          title="Log out"
        >
          <LogOut size={15} />
        </button>

      </div>

    </aside>
  );
}