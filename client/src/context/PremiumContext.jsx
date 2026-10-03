import React, { createContext, useContext, useCallback } from "react";
import { useAuth } from "./AuthContext";

// `plan` now lives on the User account itself (server-side), not in
// localStorage — so this context is just a small convenience wrapper
// around AuthContext's `user.plan` / upgradePlan / downgradePlan.
const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user, upgradePlan, downgradePlan } = useAuth();
  const isPremium = user?.plan === "pro";

  const upgrade = useCallback(async () => {
    await upgradePlan();
  }, [upgradePlan]);

  const downgrade = useCallback(async () => {
    await downgradePlan();
  }, [downgradePlan]);

  return (
    <PremiumContext.Provider value={{ isPremium, upgrade, downgrade }}>
      {children}
    </PremiumContext.Provider>
  );
}

// Usage: const { isPremium, upgrade, downgrade } = usePremium();
export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error("usePremium must be used inside <PremiumProvider>");
  }
  return ctx;
}