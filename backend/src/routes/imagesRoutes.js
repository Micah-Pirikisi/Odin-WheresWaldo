const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/imagesController");

router.get("/", ctrl.listImages);
router.get("/:id/characters", ctrl.getCharactersForImage);

module.exports = router;
