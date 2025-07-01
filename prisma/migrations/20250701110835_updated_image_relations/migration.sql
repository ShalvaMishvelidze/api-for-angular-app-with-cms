/*
  Warnings:

  - The primary key for the `ProductDraft` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `ProductDraft` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT,
    "draftId" TEXT,
    CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Image_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ProductDraft" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("createdAt", "id", "publicId", "url", "userId") SELECT "createdAt", "id", "publicId", "url", "userId" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_publicId_key" ON "Image"("publicId");
CREATE INDEX "Image_productId_idx" ON "Image"("productId");
CREATE INDEX "Image_draftId_idx" ON "Image"("draftId");
CREATE TABLE "new_ProductDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "thumbnail" TEXT,
    "images" TEXT,
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
INSERT INTO "new_ProductDraft" ("category", "createdAt", "description", "discount", "images", "name", "price", "rating", "stock", "thumbnail", "updatedAt", "userId") SELECT "category", "createdAt", "description", "discount", "images", "name", "price", "rating", "stock", "thumbnail", "updatedAt", "userId" FROM "ProductDraft";
DROP TABLE "ProductDraft";
ALTER TABLE "new_ProductDraft" RENAME TO "ProductDraft";
CREATE UNIQUE INDEX "ProductDraft_userId_key" ON "ProductDraft"("userId");
CREATE INDEX "ProductDraft_userId_idx" ON "ProductDraft"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
