require("dotenv/config");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({});

const seed = async () => {
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  await prisma.standardCondition.upsert({
    where: { key: "default_action" },
    update: {
      title: "Дія за замовчуванням",
      description: "",
      action: "Скористайтеся калькулятором або передайте запит у техвідділ для підтвердження конфігурації.",
    },
    create: {
      key: "default_action",
      title: "Дія за замовчуванням",
      description: "",
      action: "Скористайтеся калькулятором або передайте запит у техвідділ для підтвердження конфігурації.",
    },
  });

  await prisma.standardCondition.upsert({
    where: { key: "default_conditions" },
    update: {
      title: "Стандартні умови",
      description: "Умови визначаються вимогами виробника та стандартами PL/EU.",
      action: "Скористайтеся калькулятором або передайте запит у техвідділ для підтвердження конфігурації.",
    },
    create: {
      key: "default_conditions",
      title: "Стандартні умови",
      description: "Умови визначаються вимогами виробника та стандартами PL/EU.",
      action: "Скористайтеся калькулятором або передайте запит у техвідділ для підтвердження конфігурації.",
    },
  });

  await prisma.standardCondition.upsert({
    where: { key: "default_no_data" },
    update: {
      title: "Недостатньо даних",
      description: "У базі знань відсутня інформація за запитом.",
      action: "Передайте запит у техвідділ для уточнення.",
    },
    create: {
      key: "default_no_data",
      title: "Недостатньо даних",
      description: "У базі знань відсутня інформація за запитом.",
      action: "Передайте запит у техвідділ для уточнення.",
    },
  });

  const knowledgePath = path.resolve(__dirname, "..", "..", "data", "knowledge.ua.json");
  const knowledgeRaw = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));
  const knowledgeData = knowledgeRaw.map((item) => ({
    category: item.topic,
    title: item.title,
    content: item.content,
    compatibility: {
      lang: item.lang,
      tags: item.tags,
      priority: item.priority,
    },
  }));

  await prisma.knowledgeItem.deleteMany();
  await prisma.knowledgeItem.createMany({ data: knowledgeData });
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
