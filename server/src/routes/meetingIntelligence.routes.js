import { Router } from "express";
import validateBody from "../middleware/validate.js";
import { meetingIntelligenceRequestSchema } from "../schemas/meetingIntelligence.schema.js";
import { postMeetingIntelligence } from "../controllers/meetingIntelligence.controller.js";

const router = Router();

router.post(
  "/",
  validateBody(meetingIntelligenceRequestSchema, (message) => ({
    message,
  })),
  postMeetingIntelligence
);

export default router;