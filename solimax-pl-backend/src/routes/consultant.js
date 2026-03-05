const express = require("express");
const {
	askConsultant,
	leadConsultant,
	consultantHealth,
	consultantStatus,
} = require("../controllers/consultantController");
const {
	ipWindowLimiter,
	sessionWindowLimiter,
	globalDailyLimiter,
} = require("../middleware/rateLimit");

const router = express.Router();

router.get("/health", consultantHealth);
router.get("/status", consultantStatus);
router.post(
	"/ask",
	ipWindowLimiter,
	sessionWindowLimiter,
	globalDailyLimiter,
	askConsultant
);
router.post(
	"/chat",
	ipWindowLimiter,
	sessionWindowLimiter,
	globalDailyLimiter,
	askConsultant
);
router.post("/lead", leadConsultant);

module.exports = router;
