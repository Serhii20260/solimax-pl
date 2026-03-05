const DEFAULT_LLM_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 12000;

const normalizeApiUrl = (rawUrl) => {
  const input = (rawUrl || DEFAULT_LLM_URL).trim();
  if (!input) return DEFAULT_LLM_URL;
  const trimmed = input.endsWith("/") ? input.slice(0, -1) : input;
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  const base = trimmed.includes("/v1")
    ? `${trimmed.split("/v1")[0]}/v1`
    : `${trimmed}/v1`;
  return `${base}/chat/completions`;
};

const LLM_API_URL = normalizeApiUrl(process.env.CONSULTANT_LLM_API_URL);
const sanitizeKey = (key) => {
  if (!key) return "";
  const trimmed = key.trim().replace(/^sk-sk-/, "sk-");
  if (!trimmed || trimmed.includes("...") || trimmed.length < 20) return "";
  return trimmed;
};

const LLM_API_KEY = sanitizeKey(
  process.env.CONSULTANT_LLM_API_KEY || process.env.OPENAI_API_KEY || ""
);
const LLM_MODEL = process.env.CONSULTANT_LLM_MODEL || DEFAULT_MODEL;
const LLM_TIMEOUT_MS = Number(process.env.CONSULTANT_LLM_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

const isLlmEnabled = () => Boolean(LLM_API_KEY && LLM_API_KEY.trim().length > 0);

const getLlmStatus = () => ({
  llmEnabled: isLlmEnabled(),
  model: LLM_MODEL,
  reason: isLlmEnabled() ? "ok" : "missing_api_key",
});

const parseJsonContent = (content) => {
  if (!content) return null;
  const cleaned = content
    .replace(/^```json/i, "```")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*"answer_text"[\s\S]*\}/i);
    if (jsonMatch?.[0]) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return { answer_text: cleaned };
      }
    }
    return { answer_text: cleaned };
  }
};

const callConsultantLLM = async ({
  systemPrompt,
  messages,
  userQuestion,
  knowledgeContext,
  maxTokens,
  temperature = 0.3,
}) => {
  if (!isLlmEnabled()) return null;

  const conversation = Array.isArray(messages)
    ? messages.map((message) => ({ role: message.role, content: message.content }))
    : [];

  const promptMessages = [
    { role: "system", content: systemPrompt },
    ...conversation,
    {
      role: "user",
      content: [
        "User question:",
        userQuestion || "(none)",
        "",
        "IMPORTANT: If the user asks 'What is X?' or uses a foreign technical term, explain what that term/component is first using the knowledge base context below.",
        "",
        "Knowledge base context:",
        knowledgeContext || "(none)",
      ].join("\n"),
    },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const doFetch = async () =>
    fetch(LLM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: promptMessages,
      }),
      signal: controller.signal,
    });

  try {
    let response = await doFetch();
    if (!response.ok && response.status === 429) {
      await sleep(800);
      response = await doFetch();
    }

    if (!response.ok) {
      return { _error: `http_${response.status}`, _httpStatus: response.status };
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return { _error: "empty_response", _usage: payload?.usage };
    }

    const parsed = parseJsonContent(content) || {};
    return { ...parsed, _usage: payload?.usage };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { _error: "timeout" };
    }
    return { _error: "network_error" };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { callConsultantLLM, getLlmStatus, isLlmEnabled };
