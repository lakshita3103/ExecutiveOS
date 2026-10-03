import { Router } from "express";
import validateBody from "../middleware/validate.js";
import { emailRequestSchema } from "../schemas/email.schema.js";
import { postEmail } from "../controllers/email.controller.js";

const router = Router();

router.post(
  "/",
  validateBody(emailRequestSchema, () => ({
    success: false,
    error: "Prompt or email content is required",
  })),
  postEmail
);

export default router;