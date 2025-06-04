/*
  Warnings:

  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.
  - Added the required column `category` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "images" TEXT,
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
INSERT INTO "new_Product" ("createdAt", "description", "id", "name", "price", "status", "updatedAt", "userId") SELECT "createdAt", "description", "id", "name", "price", "status", "updatedAt", "userId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
