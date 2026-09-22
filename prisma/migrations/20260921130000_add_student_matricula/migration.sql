-- AlterTable
-- NOTE: assumes the "students" table has no rows yet (feature just landed,
-- nothing seeds students). If there is already data in production, backfill
-- a "matricula" value for every existing row before running this migration,
-- or it will fail on the NOT NULL constraint.
ALTER TABLE "students" ADD COLUMN "matricula" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "students_matricula_key" ON "students"("matricula");
