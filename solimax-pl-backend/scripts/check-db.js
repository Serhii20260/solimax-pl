const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const items = await prisma.knowledgeItem.findMany({
    select: { language: true, category: true, title: true, content: true },
  });

  // Count by language
  const byLang = {};
  items.forEach((i) => {
    byLang[i.language] = (byLang[i.language] || 0) + 1;
  });
  console.log("By language:", byLang);

  // Count by category
  const byCat = {};
  items.forEach((i) => {
    byCat[i.category] = (byCat[i.category] || 0) + 1;
  });
  console.log("By category:", byCat);

  // Sample items with content preview
  console.log("\nSample items (first 10):");
  items.slice(0, 10).forEach((i) => {
    console.log(`  [${i.language}/${i.category}] ${i.title}`);
    console.log(`    Content: ${i.content.slice(0, 100)}...`);
  });

  // Rules
  const rules = await prisma.consultantRule.findMany();
  console.log("\nConsultant Rules:", rules.length);
  rules.forEach((r) => {
    console.log(`  - ${r.name} (${r.type}) active=${r.active}`);
    if (r.value) console.log(`    value: ${r.value.slice(0, 80)}...`);
  });

  await prisma.$disconnect();
})();
