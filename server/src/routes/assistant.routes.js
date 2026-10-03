import { Router } from "express";
import validateBody from "../middleware/validate.js";
import { assistantRequestSchema } from "../schemas/assistant.schema.js";
import { postAssistant } from "../controllers/assistant.controller.js";

const router = Router();

router.post("/", validateBody(assistantRequestSchema), postAssistant);

export default router;