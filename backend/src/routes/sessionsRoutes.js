const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/sessionsController");

router.post("/", ctrl.createSession);
router.post("/:id/validate", ctrl.validateSelection);
router.post("/:id/finish", ctrl.finishSession);
router.get("/:id/status", ctrl.getSessionStatus);

module.exports = router;
