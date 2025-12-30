const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/scoresController");

router.get("/", ctrl.listScores);

module.exports = router;
