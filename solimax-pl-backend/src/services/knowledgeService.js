const prisma = require("../db/prisma");
const {
  equipmentSchema,
  compatibilitySchema,
  constraintSchema,
  scalingRuleSchema,
  standardConditionSchema,
} = require("../validation/knowledgeSchemas");

const resourceMap = {
  equipment: {
    model: "equipment",
    schema: equipmentSchema,
    include: undefined,
  },
  compatibility: {
    model: "compatibility",
    schema: compatibilitySchema,
    include: { equipmentA: true, equipmentB: true },
  },
  compatibilities: {
    model: "compatibility",
    schema: compatibilitySchema,
    include: { equipmentA: true, equipmentB: true },
  },
  constraints: {
    model: "constraint",
    schema: constraintSchema,
    include: undefined,
  },
  "scaling-rules": {
    model: "scalingRule",
    schema: scalingRuleSchema,
    include: undefined,
  },
  "standard-conditions": {
    model: "standardCondition",
    schema: standardConditionSchema,
    include: undefined,
  },
};

const getResourceConfig = (resource) => resourceMap[resource];

const list = async (resource) => {
  const { model, include } = resourceMap[resource];
  return prisma[model].findMany({
    include,
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (resource, id) => {
  const { model, include } = resourceMap[resource];
  const record = await prisma[model].findUnique({
    where: { id },
    include,
  });
  if (!record) {
    const error = new Error("Not Found");
    error.status = 404;
    throw error;
  }
  return record;
};

const create = async (resource, data) => {
  const { model } = resourceMap[resource];
  return prisma[model].create({ data });
};

const update = async (resource, id, data) => {
  const { model } = resourceMap[resource];
  return prisma[model].update({ where: { id }, data });
};

const remove = async (resource, id) => {
  const { model } = resourceMap[resource];
  return prisma[model].delete({ where: { id } });
};

module.exports = {
  getResourceConfig,
  list,
  getById,
  create,
  update,
  remove,
};
