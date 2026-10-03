import { Router } from "express";
import validateBody from "../middleware/validate.js";
import { reportsRequestSchema } from "../schemas/reports.schema.js";
import { postReports } from "../controllers/reports.controller.js";

const router = Router();

router.post("/", validateBody(reportsRequestSchema), postReports);

export default router;