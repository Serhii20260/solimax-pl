-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "manufacturerName" TEXT NOT NULL,
    "manufacturerUrl" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "datasheetUrl" TEXT,
    "priceLabel" TEXT,
    "specs" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPromo" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "promoLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
