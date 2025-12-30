import express from "express";
const router = express.Router();
import { listScores } from "../controllers/scoresController.js";

router.get("/", listScores);

export default router;
