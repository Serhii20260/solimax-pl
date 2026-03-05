const express = require("express");
const { requireAdminToken } = require("../middleware/adminToken");
const {
  listItems,
  newItemForm,
  editItemForm,
  createItem,
  updateItem,
  deleteItem,
  listRules,
  newRuleForm,
  editRuleForm,
  createRule,
  updateRule,
  deleteRule,
} = require("../controllers/adminPanelController");

const router = express.Router();

router.use(requireAdminToken);

router.get("/", listItems);
router.get("/new", newItemForm);
router.post("/", createItem);
router.get("/:id/edit", editItemForm);
router.post("/:id", updateItem);
router.post("/:id/delete", deleteItem);

router.get("/rules", listRules);
router.get("/rules/new", newRuleForm);
router.post("/rules", createRule);
router.get("/rules/:id/edit", editRuleForm);
router.post("/rules/:id", updateRule);
router.post("/rules/:id/delete", deleteRule);

module.exports = router;
