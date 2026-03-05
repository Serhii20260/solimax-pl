const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");

const login = async ({ email, password }) => {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    { sub: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  return { token };
};

module.exports = { login };
