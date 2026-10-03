import { Router } from "express";
import validateBody from "../middleware/validate.js";
import requireAuth from "../middleware/requireAuth.js";
import { workspaceSchema } from "../schemas/workspace.schema.js";
import { getWorkspace, saveWorkspace } from "../controllers/workspace.controller.js";

const router = Router();

router.get("/", requireAuth, getWorkspace);
router.put("/", requireAuth, validateBody(workspaceSchema), saveWorkspace);

export default router;