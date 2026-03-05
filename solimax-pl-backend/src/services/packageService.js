const prisma = require("../db/prisma");

/**
 * Transform package data for response (parse specs JSON)
 */
const transformPackage = (pkg) => {
  if (!pkg) return null;
  return {
    ...pkg,
    specs: pkg.specs ? JSON.parse(pkg.specs) : null,
  };
};

/**
 * Transform array of packages
 */
const transformPackages = (packages) => packages.map(transformPackage);

/**
 * List packages with optional filters (public API)
 */
const listPackages = async (filters = {}) => {
  const {
    category,
    tier,
    promoOnly,
    newOnly,
    activeOnly = true,
  } = filters;

  const where = {};

  // Always filter by active status unless explicitly disabled
  if (activeOnly) {
    where.isActive = true;
  }

  if (category) {
    where.category = category;
  }

  if (tier) {
    where.tier = tier;
  }

  if (promoOnly) {
    where.isPromo = true;
  }

  if (newOnly) {
    where.isNew = true;
  }

  const packages = await prisma.package.findMany({
    where,
    orderBy: [
      { category: "asc" },
      { tier: "asc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return transformPackages(packages);
};

/**
 * List all packages for admin (including inactive)
 */
const listAllPackages = async () => {
  const packages = await prisma.package.findMany({
    orderBy: [
      { category: "asc" },
      { tier: "asc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return transformPackages(packages);
};

/**
 * Get package by ID
 */
const getPackageById = async (id) => {
  const pkg = await prisma.package.findUnique({
    where: { id },
  });

  if (!pkg) {
    const error = new Error("Package not found");
    error.status = 404;
    throw error;
  }

  return transformPackage(pkg);
};

/**
 * Create new package
 */
const createPackage = async (data) => {
  // Convert specs array to JSON string for storage
  const packageData = {
    ...data,
    specs: data.specs ? JSON.stringify(data.specs) : null,
  };

  const pkg = await prisma.package.create({
    data: packageData,
  });

  return transformPackage(pkg);
};

/**
 * Update package
 */
const updatePackage = async (id, data) => {
  // Check if package exists
  const existing = await prisma.package.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Package not found");
    error.status = 404;
    throw error;
  }

  // Convert specs array to JSON string if provided
  const updateData = { ...data };
  if (data.specs !== undefined) {
    updateData.specs = data.specs ? JSON.stringify(data.specs) : null;
  }

  const pkg = await prisma.package.update({
    where: { id },
    data: updateData,
  });

  return transformPackage(pkg);
};

/**
 * Soft delete package (set isActive to false)
 */
const deletePackage = async (id) => {
  // Check if package exists
  const existing = await prisma.package.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Package not found");
    error.status = 404;
    throw error;
  }

  const pkg = await prisma.package.update({
    where: { id },
    data: { isActive: false },
  });

  return transformPackage(pkg);
};

/**
 * Hard delete package (permanent removal)
 */
const hardDeletePackage = async (id) => {
  // Check if package exists
  const existing = await prisma.package.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Package not found");
    error.status = 404;
    throw error;
  }

  await prisma.package.delete({
    where: { id },
  });

  return { success: true, id };
};

/**
 * Get packages for banners (promo or new)
 */
const getBannerPackages = async () => {
  const packages = await prisma.package.findMany({
    where: {
      isActive: true,
      OR: [
        { isPromo: true },
        { isNew: true },
      ],
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return transformPackages(packages);
};

/**
 * Update sort order for multiple packages
 */
const updateSortOrder = async (updates) => {
  // updates = [{ id: "...", sortOrder: 1 }, ...]
  const results = await Promise.all(
    updates.map(({ id, sortOrder }) =>
      prisma.package.update({
        where: { id },
        data: { sortOrder },
      })
    )
  );

  return transformPackages(results);
};

module.exports = {
  listPackages,
  listAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  hardDeletePackage,
  getBannerPackages,
  updateSortOrder,
};
