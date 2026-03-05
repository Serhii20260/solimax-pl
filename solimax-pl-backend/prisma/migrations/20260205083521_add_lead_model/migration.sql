-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consentRODO" BOOLEAN NOT NULL DEFAULT false,
    "productType" TEXT NOT NULL,
    "region" TEXT,
    "consumption" TEXT,
    "packageId" TEXT,
    "packageName" TEXT,
    "pvPower" REAL,
    "batteryCapacity" REAL,
    "houseArea" REAL,
    "householdSize" INTEGER,
    "energyClass" TEXT,
    "heatingConsumption" TEXT,
    "source" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
