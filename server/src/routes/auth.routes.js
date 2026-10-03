import { Router } from "express";
import validateBody from "../middleware/validate.js";
import requireAuth from "../middleware/requireAuth.js";
import { signupSchema, loginSchema, updateProfileSchema } from "../schemas/auth.schema.js";
import {
  signup,
  login,
  logout,
  me,
  updateProfile,
  upgradePlan,
  downgradePlan,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, validateBody(updateProfileSchema), updateProfile);
router.post("/upgrade", requireAuth, upgradePlan);
router.post("/downgrade", requireAuth, downgradePlan);

export default router;