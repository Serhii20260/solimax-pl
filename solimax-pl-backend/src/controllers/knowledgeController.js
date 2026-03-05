const {
  getResourceConfig,
  list,
  getById,
  create,
  update,
  remove,
} = require("../services/knowledgeService");

const resolveResource = (req, res, next, resource) => {
  const config = getResourceConfig(resource);
  if (!config) {
    return res.status(404).json({ error: "Resource Not Found" });
  }
  req.resource = resource;
  req.resourceConfig = config;
  return next();
};

const listKnowledge = async (req, res, next) => {
  try {
    const records = await list(req.resource);
    return res.json(records);
  } catch (error) {
    return next(error);
  }
};

const getKnowledge = async (req, res, next) => {
  try {
    const record = await getById(req.resource, req.params.id);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
};

const createKnowledge = async (req, res, next) => {
  try {
    const payload = req.resourceConfig.schema.parse(req.body);
    const record = await create(req.resource, payload);
    return res.status(201).json(record);
  } catch (error) {
    return next(error);
  }
};

const updateKnowledge = async (req, res, next) => {
  try {
    const payload = req.resourceConfig.schema.partial().parse(req.body);
    const record = await update(req.resource, req.params.id, payload);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
};

const deleteKnowledge = async (req, res, next) => {
  try {
    const record = await remove(req.resource, req.params.id);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  resolveResource,
  listKnowledge,
  getKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
};
