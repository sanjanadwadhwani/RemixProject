/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Contact` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first" TEXT,
    "last" TEXT,
    "avatar" TEXT,
    "twitter" TEXT,
    "phone" TEXT,
    "birthday" DATETIME,
    "notes" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Contact" ("avatar", "favorite", "first", "id", "last", "notes", "twitter") SELECT "avatar", coalesce("favorite", false) AS "favorite", "first", "id", "last", "notes", "twitter" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
PRAGMA foreign_key_check("Contact");
PRAGMA foreign_keys=ON;
