const { z } = require("zod");

const equipmentSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  manufacturer: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
});

const compatibilitySchema = z.object({
  equipmentAId: z.string().min(1),
  equipmentBId: z.string().min(1),
  conditions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const constraintSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  appliesTo: z.string().optional().nullable(),
  conditions: z.string().optional().nullable(),
});

const scalingRuleSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  conditions: z.string().optional().nullable(),
  minKw: z.number().optional().nullable(),
  maxKw: z.number().optional().nullable(),
  inverterRequirement: z.string().optional().nullable(),
});

const standardConditionSchema = z.object({
  key: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  action: z.string().min(2),
});

module.exports = {
  equipmentSchema,
  compatibilitySchema,
  constraintSchema,
  scalingRuleSchema,
  standardConditionSchema,
};
