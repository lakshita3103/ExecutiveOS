import { Router } from "express";
import aiRateLimiter from "../middleware/rateLimiter.js";
import assistantRoutes from "./assistant.routes.js";
import emailRoutes from "./email.routes.js";
import meetingIntelligenceRoutes from "./meetingIntelligence.routes.js";
import reportsRoutes from "./reports.routes.js";
import authRoutes from "./auth.routes.js";
import workspaceRoutes from "./workspace.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "ExecutiveOS AI server is running" });
});

router.get("/healthz", (req, res) => {
  res.json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
});

router.use("/api/auth", authRoutes);
router.use("/api/workspace", workspaceRoutes);

// All AI-backed routes share a rate limiter — each call costs a real
// Gemini request, so we throttle here before any of them fire.
router.use("/api/assistant", aiRateLimiter, assistantRoutes);
router.use("/api/email", aiRateLimiter, emailRoutes);
router.use("/api/meeting-intelligence", aiRateLimiter, meetingIntelligenceRoutes);
router.use("/api/reports", aiRateLimiter, reportsRoutes);

export default router;