const { z } = require("zod");

// Enum values
const categoryEnum = z.enum(["home", "business", "heatpumps"]);
const tierEnum = z.enum(["standard", "premium"]);

// Spec item schema
const specItemSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

// Create package schema
const createPackageSchema = z.object({
  category: categoryEnum,
  tier: tierEnum,
  title: z.string().min(2, "Title must be at least 2 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  fullDescription: z.string().min(20, "Full description must be at least 20 characters"),
  manufacturerName: z.string().min(2, "Manufacturer name is required"),
  manufacturerUrl: z.string().url("Must be a valid URL"),
  imageUrl: z.string().min(1, "Image URL is required"),
  datasheetUrl: z.string().url("Must be a valid URL").optional().nullable(),
  priceLabel: z.string().optional().nullable(),
  specs: z.array(specItemSchema).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  isPromo: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  promoLabel: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

// Update package schema (all fields optional)
const updatePackageSchema = z.object({
  category: categoryEnum.optional(),
  tier: tierEnum.optional(),
  title: z.string().min(2).optional(),
  shortDescription: z.string().min(10).optional(),
  fullDescription: z.string().min(20).optional(),
  manufacturerName: z.string().min(2).optional(),
  manufacturerUrl: z.string().url().optional(),
  imageUrl: z.string().min(1).optional(),
  datasheetUrl: z.string().url().optional().nullable(),
  priceLabel: z.string().optional().nullable(),
  specs: z.array(specItemSchema).optional().nullable(),
  isActive: z.boolean().optional(),
  isPromo: z.boolean().optional(),
  isNew: z.boolean().optional(),
  promoLabel: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

// Query params schema for public API
const listPackagesQuerySchema = z.object({
  category: categoryEnum.optional(),
  tier: tierEnum.optional(),
  promoOnly: z.string().transform(v => v === "true").optional(),
  newOnly: z.string().transform(v => v === "true").optional(),
  activeOnly: z.string().transform(v => v !== "false").optional().default("true"),
});

module.exports = {
  createPackageSchema,
  updatePackageSchema,
  listPackagesQuerySchema,
  categoryEnum,
  tierEnum,
};
