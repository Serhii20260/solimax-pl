const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const rules = [
  {
    name: "Strict language match",
    type: "system_prompt_append",
    language: null,
    value:
      "The answer MUST be written strictly in the same language as the user question. Do NOT switch language. Do NOT translate.",
    priority: 10,
    active: true,
  },
  {
    name: "No questions in answer",
    type: "system_prompt_append",
    language: null,
    value: "Answer with a complete, final response in 2–4 sentences. Be concise and relevant; avoid verbosity. Do NOT ask questions.",
    priority: 20,
    active: true,
  },
  {
    name: "Language source policy",
    type: "language_source",
    language: null,
    value: "detect_then_payload",
    priority: 5,
    active: true,
  },
];

const upsertRules = async () => {
  for (const rule of rules) {
    const existing = await prisma.consultantRule.findFirst({
      where: { name: rule.name },
    });

    if (existing) {
      await prisma.consultantRule.update({
        where: { id: existing.id },
        data: rule,
      });
    } else {
      await prisma.consultantRule.create({ data: rule });
    }
  }

  const count = await prisma.consultantRule.count();
  console.log("CONSULTANT_RULE_COUNT", count);
};

upsertRules()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
