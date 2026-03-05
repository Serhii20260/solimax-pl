require("dotenv/config");
const http = require("http");
const app = require("./app");

const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";
const healthHost = process.env.HEALTH_HOST || "127.0.0.1";

const server = app.listen(port, host, () => {
  console.log(`Solimax backend listening on ${host}:${port}`);

  const healthUrl = `http://${healthHost}:${port}/api/health`;
  const req = http.get(healthUrl, (res) => {
    const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 300;
    console.log(
      `Health check ${ok ? "OK" : "FAILED"}: ${healthUrl} (${res.statusCode})`
    );
    res.resume();
  });

  req.on("error", (error) => {
    console.log(`Health check FAILED: ${healthUrl} (${error.message})`);
  });
});

const shutdown = (signal) => {
  console.log(`\n[server] Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log("[server] HTTP server closed");
    process.exit(0);
  });
  // Force close after 10s
  setTimeout(() => {
    console.error("[server] Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught exceptions - log but don't crash in dev
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught Exception:", err.message);
  console.error(err.stack);
  if (process.env.NODE_ENV === "production") {
    shutdown("uncaughtException");
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("[server] Unhandled Rejection at:", promise);
  console.error("[server] Reason:", reason);
});
