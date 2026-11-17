-- CreateEnum
CREATE TYPE "entry_type" AS ENUM ('GASTO', 'LUCRO');

-- CreateTable
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "type" "entry_type" NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);
