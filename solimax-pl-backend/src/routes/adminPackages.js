const express = require("express");
const multer = require("multer");
const { requireAdminAuth } = require("../middleware/auth");
const {
  adminListPackages,
  adminGetPackage,
  createPackage,
  updatePackage,
  deletePackage,
  updateSortOrder,
} = require("../controllers/packageController");
const {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  listFiles,
} = require("../controllers/uploadController");

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10), // 5MB default
  },
});

// All routes require admin authentication
router.use(requireAdminAuth);

/**
 * PACKAGE CRUD ROUTES
 */

// GET /api/admin/packages - List all packages (including inactive)
router.get("/", adminListPackages);

// POST /api/admin/packages - Create new package
router.post("/", createPackage);

// PUT /api/admin/packages/sort - Update sort order for multiple packages
// Must be before /:id to avoid conflict
router.put("/sort", updateSortOrder);

// GET /api/admin/packages/:id - Get package by ID
router.get("/:id", adminGetPackage);

// PUT /api/admin/packages/:id - Update package
router.put("/:id", updatePackage);

// DELETE /api/admin/packages/:id - Delete package (soft by default, ?hard=true for permanent)
router.delete("/:id", deletePackage);

/**
 * FILE UPLOAD ROUTES
 */

// GET /api/admin/upload - List all uploaded files
router.get("/upload", listFiles);

// POST /api/admin/upload - Upload single file
router.post("/upload", upload.single("file"), uploadFile);

// POST /api/admin/upload/multiple - Upload multiple files
router.post("/upload/multiple", upload.array("files", 10), uploadMultipleFiles);

// DELETE /api/admin/upload/:filename - Delete file
router.delete("/upload/:filename", deleteFile);

module.exports = router;
