import express from "express";
const router = express.Router();
import { listImages, getCharactersForImage} from "../controllers/imagesController.js";

router.get("/", listImages);
router.get("/:id/characters", getCharactersForImage);

export default router;
