const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const healthRoutes = require("./routes/health");
const consultantRoutes = require("./routes/consultant");
const adminRoutes = require("./routes/admin");
const adminPanelRoutes = require("./routes/adminPanel");
const packagesRoutes = require("./routes/packages");
const adminPackagesRoutes = require("./routes/adminPackages");
const { generalLimiter, authLimiter } = require("./middleware/rateLimit");
const { notFoundHandler, errorHandler } = require("./middleware/error");

const app = express();
const corsOrigins = process.env.CORS_ORIGIN
	? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
	: true;

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Static files for uploads
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "uploads")));

// Public routes
app.use("/api/health", healthRoutes);
app.use("/api/consultant", generalLimiter, consultantRoutes);
app.use("/api/packages", generalLimiter, packagesRoutes);

// Admin routes
app.use("/api/admin", authLimiter, adminRoutes);
app.use("/api/admin/packages", authLimiter, adminPackagesRoutes);
app.use("/admin", adminPanelRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
