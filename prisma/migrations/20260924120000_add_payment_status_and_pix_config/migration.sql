-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
-- Pagamentos já existentes foram todos registrados pelo fluxo interno (autenticado),
-- então recebem status APPROVED por padrão para não quebrar nenhum cálculo de arrecadação.
ALTER TABLE "payments"
    ADD COLUMN "status" "payment_status" NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN "approved_at" TIMESTAMP(3),
    ADD COLUMN "approved_by" TEXT,
    ADD COLUMN "rejected_reason" TEXT;

UPDATE "payments" SET "approved_at" = "created_at" WHERE "status" = 'APPROVED';
