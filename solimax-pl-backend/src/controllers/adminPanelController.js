const prisma = require("../db/prisma");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderLayout = (title, body) => `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --danger: #dc2626;
      --danger-hover: #b91c1c;
      --success: #16a34a;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
      --text: #1e293b;
      --text-muted: #64748b;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: var(--primary);
      margin-bottom: 24px;
      font-size: 1.75rem;
    }
    a {
      color: var(--primary);
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-top: 16px;
    }
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    tr:hover { background: #f8fafc; }
    tr:last-child td { border-bottom: none; }
    form {
      background: var(--card);
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 700px;
    }
    form > div { margin-bottom: 16px; }
    label {
      font-weight: 500;
      display: block;
      margin-bottom: 6px;
    }
    input[type="text"], input[type="number"], select, textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    textarea { resize: vertical; min-height: 100px; }
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      vertical-align: middle;
      margin-left: 8px;
    }
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    button[type="submit"] {
      background: var(--primary);
      color: white;
    }
    button[type="submit"]:hover { background: var(--primary-hover); }
    form + form button { background: var(--danger); color: white; margin-top: 12px; }
    form + form button:hover { background: var(--danger-hover); }
    .nav-links {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .nav-links a {
      padding: 8px 16px;
      background: var(--primary);
      color: white;
      border-radius: 6px;
      font-weight: 500;
    }
    .nav-links a:hover {
      background: var(--primary-hover);
      text-decoration: none;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-active { background: #dcfce7; color: var(--success); }
    .badge-inactive { background: #fee2e2; color: var(--danger); }
    .badge-lang { background: #e0e7ff; color: #4338ca; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;

const listItems = async (req, res, next) => {
  try {
    const items = await prisma.knowledgeItem.findMany({
      orderBy: { updatedAt: "desc" },
    });

    const rows = items
      .map(
        (item) => `
        <tr>
          <td><span class="badge badge-lang">${escapeHtml(item.language || "pl")}</span></td>
          <td>${escapeHtml(item.category)}</td>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.updatedAt.toISOString().split('T')[0])}</td>
          <td>
            <a href="/admin/${item.id}/edit">Edit</a>
          </td>
        </tr>`
      )
      .join("");

    const body = `
      <div class="nav-links">
        <a href="/admin/new">+ New Knowledge Item</a>
        <a href="/admin/rules">Manage Rules</a>
      </div>
      <p style="color:var(--text-muted);">Total items: ${items.length}</p>
      <table>
        <thead>
          <tr>
            <th>Lang</th>
            <th>Category</th>
            <th>Title</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    res.send(renderLayout("Knowledge Items", body));
  } catch (error) {
    next(error);
  }
};

const renderForm = ({ item }) => {
  const isEdit = Boolean(item);
  const actionPath = isEdit ? `/admin/${item.id}` : "/admin";
  const deleteForm = isEdit
    ? `<form method="post" action="/admin/${item.id}/delete">
        <button type="submit">Delete</button>
      </form>`
    : "";

  return `
    <form method="post" action="${actionPath}">
      <div>
        <label>Language</label><br />
        <select name="language" required>
          ${["pl", "ua", "de", "en"]
            .map(
              (lang) =>
                `<option value="${lang}"${
                  (item?.language || "pl") === lang ? " selected" : ""
                }>${lang.toUpperCase()}</option>`
            )
            .join("")}
        </select>
      </div>
      <div>
        <label>Category</label><br />
        <input name="category" required value="${escapeHtml(item?.category)}" />
      </div>
      <div>
        <label>Title</label><br />
        <input name="title" required value="${escapeHtml(item?.title)}" />
      </div>
      <div>
        <label>Content</label><br />
        <textarea name="content" rows="6" cols="60" required>${escapeHtml(
          item?.content
        )}</textarea>
      </div>
      <div>
        <label>Compatibility (JSON)</label><br />
        <textarea name="compatibility" rows="4" cols="60">${escapeHtml(
          item?.compatibility ? JSON.stringify(item.compatibility, null, 2) : ""
        )}</textarea>
      </div>
      <div>
        <label>Constraints (JSON)</label><br />
        <textarea name="constraints" rows="4" cols="60">${escapeHtml(
          item?.constraints ? JSON.stringify(item.constraints, null, 2) : ""
        )}</textarea>
      </div>
      <button type="submit">Save</button>
    </form>
    ${deleteForm}
    <p><a href="/admin">Back</a></p>`;
};

const newItemForm = (req, res) => {
  res.send(renderLayout("New Knowledge Item", renderForm({})));
};

const editItemForm = async (req, res, next) => {
  try {
    const item = await prisma.knowledgeItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      return res.status(404).send("Not Found");
    }

    return res.send(renderLayout("Edit Knowledge Item", renderForm({ item })));
  } catch (error) {
    return next(error);
  }
};

const parseJsonField = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return { error: "Invalid JSON" };
  }
};

const createItem = async (req, res, next) => {
  try {
    const compatibility = parseJsonField(req.body.compatibility);
    const constraints = parseJsonField(req.body.constraints);

    if (compatibility?.error || constraints?.error) {
      return res.status(400).send("Invalid JSON in compatibility or constraints");
    }

    await prisma.knowledgeItem.create({
      data: {
        language: req.body.language || "pl",
        category: req.body.category,
        title: req.body.title,
        content: req.body.content,
        compatibility,
        constraints,
      },
    });

    return res.redirect(`/admin`);
  } catch (error) {
    return next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const compatibility = parseJsonField(req.body.compatibility);
    const constraints = parseJsonField(req.body.constraints);

    if (compatibility?.error || constraints?.error) {
      return res.status(400).send("Invalid JSON in compatibility or constraints");
    }

    await prisma.knowledgeItem.update({
      where: { id: req.params.id },
      data: {
        language: req.body.language || "pl",
        category: req.body.category,
        title: req.body.title,
        content: req.body.content,
        compatibility,
        constraints,
      },
    });

    return res.redirect(`/admin`);
  } catch (error) {
    return next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await prisma.knowledgeItem.delete({ where: { id: req.params.id } });
    return res.redirect(`/admin`);
  } catch (error) {
    return next(error);
  }
};

const listRules = async (req, res, next) => {
  try {
    const rules = await prisma.consultantRule.findMany({
      orderBy: [{ active: "desc" }, { priority: "asc" }, { updatedAt: "desc" }],
    });

    const rows = rules
      .map(
        (rule) => `
        <tr>
          <td><span class="badge ${rule.active ? 'badge-active' : 'badge-inactive'}">${rule.active ? "Active" : "Off"}</span></td>
          <td>${escapeHtml(rule.priority)}</td>
          <td><span class="badge badge-lang">${escapeHtml(rule.language || "*")}</span></td>
          <td><code>${escapeHtml(rule.type)}</code></td>
          <td>${escapeHtml(rule.name)}</td>
          <td>${escapeHtml(rule.updatedAt.toISOString().split('T')[0])}</td>
          <td>
            <a href="/admin/rules/${rule.id}/edit">Edit</a>
          </td>
        </tr>`
      )
      .join("");

    const body = `
      <div class="nav-links">
        <a href="/admin">← Knowledge Items</a>
        <a href="/admin/rules/new">+ New Rule</a>
      </div>
      <p style="color:var(--text-muted);">Total rules: ${rules.length} (active: ${rules.filter(r => r.active).length})</p>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Priority</th>
            <th>Lang</th>
            <th>Type</th>
            <th>Name</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    res.send(renderLayout("Consultant Rules", body));
  } catch (error) {
    next(error);
  }
};

const renderRuleForm = ({ rule }) => {
  const isEdit = Boolean(rule);
  const actionPath = isEdit ? `/admin/rules/${rule.id}` : "/admin/rules";
  const deleteForm = isEdit
    ? `<form method="post" action="/admin/rules/${rule.id}/delete">
        <button type="submit">Delete</button>
      </form>`
    : "";

  return `
    <form method="post" action="${actionPath}">
      <div>
        <label>Name</label><br />
        <input type="text" name="name" required value="${escapeHtml(rule?.name)}" />
      </div>
      <div>
        <label>Type</label><br />
        <select name="type" required>
          ${[
            "system_prompt_append",
            "language_source",
            "force_kb_only",
            "category_boost",
            "max_tokens_override",
            "temperature_override",
            "forbidden_topics",
            "cta_override",
          ]
            .map(
              (type) =>
                `<option value="${type}"${
                  rule?.type === type ? " selected" : ""
                }>${type}</option>`
            )
            .join("")}
        </select>
        <small style="color:#64748b;display:block;margin-top:4px;">
          system_prompt_append — додати текст до системного промпту<br/>
          language_source — налаштування визначення мови<br/>
          force_kb_only — вимкнути LLM (тільки KB)<br/>
          category_boost — підвищити пріоритет категорії (value: category name)<br/>
          max_tokens_override — змінити ліміт токенів відповіді (value: number)<br/>
          temperature_override — змінити temperature LLM (value: 0.0-1.0)<br/>
          forbidden_topics — заборонені теми (value: comma-separated)<br/>
          cta_override — замінити CTA (value: cta text)
        </small>
      </div>
      <div>
        <label>Language (optional)</label><br />
        <select name="language">
          ${["", "pl", "ua", "de", "en"]
            .map(
              (lang) =>
                `<option value="${lang}"${
                  (rule?.language || "") === lang ? " selected" : ""
                }>${lang ? lang.toUpperCase() : "* (all)"}</option>`
            )
            .join("")}
        </select>
      </div>
      <div>
        <label>Priority</label><br />
        <input name="priority" type="number" value="${escapeHtml(
          rule?.priority ?? 100
        )}" />
        <small style="color:#64748b;display:block;margin-top:4px;">Lower = higher priority (1-100)</small>
      </div>
      <div>
        <label>Active
        <input name="active" type="checkbox"${rule?.active !== false ? " checked" : ""} /></label>
      </div>
      <div>
        <label>Value</label><br />
        <textarea name="value" rows="6" cols="60">${escapeHtml(
          rule?.value
        )}</textarea>
      </div>
      <button type="submit">Save</button>
    </form>
    ${deleteForm}
    <p><a href="/admin/rules">Back</a></p>`;
};

const newRuleForm = (req, res) => {
  res.send(renderLayout("New Rule", renderRuleForm({})));
};

const editRuleForm = async (req, res, next) => {
  try {
    const rule = await prisma.consultantRule.findUnique({
      where: { id: req.params.id },
    });

    if (!rule) {
      return res.status(404).send("Not Found");
    }

    return res.send(renderLayout("Edit Rule", renderRuleForm({ rule })));
  } catch (error) {
    return next(error);
  }
};

const createRule = async (req, res, next) => {
  try {
    await prisma.consultantRule.create({
      data: {
        name: req.body.name,
        type: req.body.type,
        language: req.body.language || null,
        value: req.body.value || null,
        priority: Number(req.body.priority) || 100,
        active: Boolean(req.body.active),
      },
    });

    return res.redirect(`/admin/rules`);
  } catch (error) {
    return next(error);
  }
};

const updateRule = async (req, res, next) => {
  try {
    await prisma.consultantRule.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        type: req.body.type,
        language: req.body.language || null,
        value: req.body.value || null,
        priority: Number(req.body.priority) || 100,
        active: Boolean(req.body.active),
      },
    });

    return res.redirect(`/admin/rules`);
  } catch (error) {
    return next(error);
  }
};

const deleteRule = async (req, res, next) => {
  try {
    await prisma.consultantRule.delete({ where: { id: req.params.id } });
    return res.redirect(`/admin/rules`);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listItems,
  newItemForm,
  editItemForm,
  createItem,
  updateItem,
  deleteItem,
  listRules,
  newRuleForm,
  editRuleForm,
  createRule,
  updateRule,
  deleteRule,
};
