import express from "express";
const router = express.Router();
import {
  createSession,
  validateSelection,
  finishSession,
  getSessionStatus,
} from "../controllers/sessionsController.js";

router.post("/", createSession);
router.post("/:id/validate", validateSelection);
router.post("/:id/finish", finishSession);
router.get("/:id/status", getSessionStatus);

export default router;
