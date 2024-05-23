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
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Contact" ("avatar", "birthday", "favorite", "first", "id", "last", "notes", "phone", "twitter") SELECT "avatar", "birthday", "favorite", "first", "id", "last", "notes", "phone", "twitter" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
PRAGMA foreign_key_check("Contact");
PRAGMA foreign_keys=ON;
