const express = require("express");
const { loginAdmin } = require("../controllers/adminAuthController");
const { knowledgeRouter } = require("../routes/knowledge");

const router = express.Router();

router.post("/login", loginAdmin);
router.use("/knowledge", knowledgeRouter);

module.exports = router;
