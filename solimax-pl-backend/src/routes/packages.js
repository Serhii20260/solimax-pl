const express = require("express");
const {
  listPackages,
  getPackage,
  getBanners,
} = require("../controllers/packageController");

const router = express.Router();

/**
 * PUBLIC ROUTES - No authentication required
 * These endpoints are used by the frontend to fetch package data
 */

// GET /api/packages/banners - Get packages for banners (promo or new)
// Must be before /:id to avoid conflict
router.get("/banners", getBanners);

// GET /api/packages - List packages with optional filters
// Query params: category, tier, promoOnly, newOnly, activeOnly
router.get("/", listPackages);

// GET /api/packages/:id - Get single package by ID
router.get("/:id", getPackage);

module.exports = router;
