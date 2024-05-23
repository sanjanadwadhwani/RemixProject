-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "payment" INTEGER NOT NULL,
    "account" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,
    "contactId" INTEGER NOT NULL,
    CONSTRAINT "Payment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
