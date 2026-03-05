-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "compatibility" JSONB,
    "constraints" JSONB,
    "updatedAt" DATETIME NOT NULL
);
