const packageService = require("../services/packageService");
const {
  createPackageSchema,
  updatePackageSchema,
  listPackagesQuerySchema,
} = require("../validation/packageSchemas");

/**
 * PUBLIC: List packages with filters
 * GET /api/packages
 */
const listPackages = async (req, res, next) => {
  try {
    const validation = listPackagesQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: validation.error.errors,
      });
    }

    const packages = await packageService.listPackages(validation.data);
    return res.json(packages);
  } catch (error) {
    return next(error);
  }
};

/**
 * PUBLIC: Get package by ID
 * GET /api/packages/:id
 */
const getPackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await packageService.getPackageById(id);
    return res.json(pkg);
  } catch (error) {
    return next(error);
  }
};

/**
 * PUBLIC: Get banner packages (promo or new)
 * GET /api/packages/banners
 */
const getBanners = async (req, res, next) => {
  try {
    const packages = await packageService.getBannerPackages();
    return res.json(packages);
  } catch (error) {
    return next(error);
  }
};

// ============ ADMIN ENDPOINTS ============

/**
 * ADMIN: List all packages (including inactive)
 * GET /api/admin/packages
 */
const adminListPackages = async (req, res, next) => {
  try {
    const packages = await packageService.listAllPackages();
    return res.json(packages);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: Get package by ID
 * GET /api/admin/packages/:id
 */
const adminGetPackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pkg = await packageService.getPackageById(id);
    return res.json(pkg);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: Create new package
 * POST /api/admin/packages
 */
const createPackage = async (req, res, next) => {
  try {
    const validation = createPackageSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const pkg = await packageService.createPackage(validation.data);
    return res.status(201).json(pkg);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: Update package
 * PUT /api/admin/packages/:id
 */
const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const validation = updatePackageSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const pkg = await packageService.updatePackage(id, validation.data);
    return res.json(pkg);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: Soft delete package (deactivate)
 * DELETE /api/admin/packages/:id
 */
const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    if (hard === "true") {
      const result = await packageService.hardDeletePackage(id);
      return res.json(result);
    }

    const pkg = await packageService.deletePackage(id);
    return res.json(pkg);
  } catch (error) {
    return next(error);
  }
};

/**
 * ADMIN: Update sort order for multiple packages
 * PUT /api/admin/packages/sort
 */
const updateSortOrder = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        details: "updates must be a non-empty array",
      });
    }

    // Validate each update
    for (const update of updates) {
      if (!update.id || typeof update.sortOrder !== "number") {
        return res.status(400).json({
          error: "Invalid request",
          details: "Each update must have id and sortOrder",
        });
      }
    }

    const packages = await packageService.updateSortOrder(updates);
    return res.json(packages);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  // Public
  listPackages,
  getPackage,
  getBanners,
  // Admin
  adminListPackages,
  adminGetPackage,
  createPackage,
  updatePackage,
  deletePackage,
  updateSortOrder,
};
