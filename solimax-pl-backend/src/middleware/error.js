const { ZodError } = require("zod");

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Not Found" });
};

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(`[error] ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: "ValidationError", details: err.issues });
  }

  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production" 
    ? "Internal Server Error" 
    : err.message || "Internal Server Error";

  return res.status(status).json({ error: message });
};

module.exports = { notFoundHandler, errorHandler };
