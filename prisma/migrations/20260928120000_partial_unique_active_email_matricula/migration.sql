-- O UNIQUE(email, deleted_at) antigo não impedia duplicatas entre registros ativos:
-- no Postgres NULL <> NULL, então (email, NULL) nunca conflita com (email, NULL).
-- Índice parcial garante unicidade só entre registros não removidos (soft delete).
-- ATENÇÃO: falha se já existirem e-mails/matrículas duplicados entre registros ativos.
-- Prisma não modela índice parcial: por isso ele vive só aqui, fora do schema.prisma.

-- DropIndex
DROP INDEX "users_email_deleted_at_key";

-- DropIndex
DROP INDEX "students_matricula_deleted_at_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_email_active_key" ON "users"("email") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "students_matricula_active_key" ON "students"("matricula") WHERE "deleted_at" IS NULL;
