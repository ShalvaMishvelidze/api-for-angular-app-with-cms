-- CreateTable
CREATE TABLE "ProductDraft" (
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
    "userId" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "ProductDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProductDraft_userId_idx" ON "ProductDraft"("userId");
