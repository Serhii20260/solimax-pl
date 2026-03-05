const rateLimit = require("express-rate-limit");

const dailyCounters = new Map();
const ipCounters = new Map();
const sessionCounters = new Map();

const getDayStamp = () => new Date().toISOString().slice(0, 10);

const getIpKey = (req) => req.ip || "unknown";

const getSessionKey = (req) =>
  req.body?.sessionId || req.query?.sessionId || req.headers["x-session-id"] || "anon";

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const askLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const updateWindow = (map, key, limit, windowMs) => {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || entry.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  map.set(key, entry);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
};

const ipWindowLimiter = (req, res, next) => {
  if (process.env.NODE_ENV !== "production" && process.env.FORCE_RATE_LIMIT !== "true") {
    return next();
  }
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const limit = 30;
  const ip = getIpKey(req);
  const result = updateWindow(ipCounters, ip, limit, windowMs);

  res.locals.rateLimitRemaining = {
    ...(res.locals.rateLimitRemaining || {}),
    ip: result.remaining,
  };

  if (!result.allowed) {
    res.locals.rateLimited = true;
    return res.status(429).json({
      answer_text: "Сервіс тимчасово перевантажений. Спробуйте пізніше.",
      missing_questions: [],
      cta: "none",
      meta: { usedLLM: false, language: "unknown" },
    });
  }

  return next();
};

const sessionWindowLimiter = (req, res, next) => {
  if (process.env.NODE_ENV !== "production" && process.env.FORCE_RATE_LIMIT !== "true") {
    return next();
  }
  const windowMs = 60 * 1000;
  const limit = 20;
  const sessionId = getSessionKey(req);
  const result = updateWindow(sessionCounters, sessionId, limit, windowMs);

  res.locals.rateLimitRemaining = {
    ...(res.locals.rateLimitRemaining || {}),
    session: result.remaining,
  };

  if (!result.allowed) {
    res.locals.rateLimited = true;
    return res.status(429).json({
      answer_text: "Сервіс тимчасово перевантажений. Спробуйте пізніше.",
      missing_questions: [],
      cta: "none",
      meta: { usedLLM: false, language: "unknown" },
    });
  }

  return next();
};

const globalDailyLimiter = (req, res, next) => {
  if (process.env.NODE_ENV !== "production" && process.env.FORCE_RATE_LIMIT !== "true") {
    return next();
  }
  const day = getDayStamp();
  const limit = Number(process.env.DAILY_DIALOG_LIMIT || 1000);
  const key = `global:${day}`;
  const current = dailyCounters.get(key) || 0;

  if (current >= limit) {
    res.locals.rateLimited = true;
    return res.status(429).json({
      answer_text: "Сервіс тимчасово перевантажений. Спробуйте пізніше.",
      missing_questions: [],
      cta: "none",
      meta: { usedLLM: false, language: "unknown" },
    });
  }

  dailyCounters.set(key, current + 1);
  res.locals.rateLimitRemaining = {
    ...(res.locals.rateLimitRemaining || {}),
    daily: Math.max(0, limit - current - 1),
  };
  return next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  ipWindowLimiter,
  sessionWindowLimiter,
  globalDailyLimiter,
};
