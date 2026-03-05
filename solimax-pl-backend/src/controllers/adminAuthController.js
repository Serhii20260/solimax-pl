const { adminLoginSchema } = require("../validation/adminAuthSchemas");
const { login } = require("../services/adminAuthService");

const loginAdmin = async (req, res, next) => {
  try {
    const payload = adminLoginSchema.parse(req.body);
    const result = await login(payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { loginAdmin };
