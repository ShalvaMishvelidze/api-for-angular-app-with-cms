/*
  Warnings:

  - You are about to drop the column `rating` on the `ProductDraft` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "description" TEXT,
    "discount" INTEGER,
    "price" REAL,
    "stock" INTEGER,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ProductDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductDraft" ("category", "createdAt", "description", "discount", "id", "name", "price", "stock", "updatedAt", "userId") SELECT "category", "createdAt", "description", "discount", "id", "name", "price", "stock", "updatedAt", "userId" FROM "ProductDraft";
DROP TABLE "ProductDraft";
ALTER TABLE "new_ProductDraft" RENAME TO "ProductDraft";
CREATE UNIQUE INDEX "ProductDraft_userId_key" ON "ProductDraft"("userId");
CREATE INDEX "ProductDraft_userId_idx" ON "ProductDraft"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
