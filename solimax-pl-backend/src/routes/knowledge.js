const express = require("express");
const { requireAdminAuth } = require("../middleware/auth");
const {
  listKnowledge,
  getKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  resolveResource,
} = require("../controllers/knowledgeController");

const router = express.Router();

router.use(requireAdminAuth);
router.param("resource", resolveResource);

router.get("/:resource", listKnowledge);
router.post("/:resource", createKnowledge);
router.get("/:resource/:id", getKnowledge);
router.put("/:resource/:id", updateKnowledge);
router.delete("/:resource/:id", deleteKnowledge);

module.exports = { knowledgeRouter: router };
