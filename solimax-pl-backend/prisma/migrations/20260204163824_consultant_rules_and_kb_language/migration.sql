-- CreateTable
CREATE TABLE "ConsultantRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "language" TEXT,
    "value" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KnowledgeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "language" TEXT NOT NULL DEFAULT 'pl',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "compatibility" JSONB,
    "constraints" JSONB,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_KnowledgeItem" ("category", "compatibility", "constraints", "content", "id", "title", "updatedAt") SELECT "category", "compatibility", "constraints", "content", "id", "title", "updatedAt" FROM "KnowledgeItem";
DROP TABLE "KnowledgeItem";
ALTER TABLE "new_KnowledgeItem" RENAME TO "KnowledgeItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
