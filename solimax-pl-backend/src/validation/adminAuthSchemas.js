const { z } = require("zod");

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

module.exports = { adminLoginSchema };
