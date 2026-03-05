const COOKIE_NAME = "admin_token";

const extractAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return { token: authHeader.replace("Bearer ", "").trim(), source: "authHeader" };
  }

  if (req.headers["x-admin-token"]) {
    return { token: String(req.headers["x-admin-token"]).trim(), source: "header" };
  }

  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return { token: String(req.cookies[COOKIE_NAME]).trim(), source: "cookie" };
  }

  if (req.query && req.query.token) {
    return { token: String(req.query.token).trim(), source: "query" };
  }

  if (req.body && req.body.token) {
    return { token: String(req.body.token).trim(), source: "body" };
  }

  return { token: null, source: null };
};

const requireAdminToken = (req, res, next) => {
  const { token, source } = extractAdminToken(req);
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  if ((source === "query" || source === "body") && req.cookies?.[COOKIE_NAME] !== token) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    if (req.method === "GET" && source === "query") {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const url = new URL(req.originalUrl, baseUrl);
      url.searchParams.delete("token");
      return res.redirect(`${url.pathname}${url.search}`);
    }
  }

  req.adminToken = token;
  return next();
};

module.exports = { requireAdminToken, extractAdminToken };
