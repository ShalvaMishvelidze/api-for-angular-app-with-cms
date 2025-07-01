/*
  Warnings:

  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `ProductDraft` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `ProductDraft` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("category", "createdAt", "description", "discount", "id", "name", "price", "rating", "status", "stock", "updatedAt", "userId") SELECT "category", "createdAt", "description", "discount", "id", "name", "price", "rating", "status", "stock", "updatedAt", "userId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
CREATE TABLE "new_ProductDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "description" TEXT,
    "discount" INTEGER,
    "price" REAL,
    "rating" REAL,
    "stock" INTEGER,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ProductDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductDraft" ("category", "createdAt", "description", "discount", "id", "name", "price", "rating", "stock", "updatedAt", "userId") SELECT "category", "createdAt", "description", "discount", "id", "name", "price", "rating", "stock", "updatedAt", "userId" FROM "ProductDraft";
DROP TABLE "ProductDraft";
ALTER TABLE "new_ProductDraft" RENAME TO "ProductDraft";
CREATE UNIQUE INDEX "ProductDraft_userId_key" ON "ProductDraft"("userId");
CREATE INDEX "ProductDraft_userId_idx" ON "ProductDraft"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
