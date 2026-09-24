-- CreateIndex
-- Consultas por aluno (histórico e soma de pagamentos aprovados) filtram por student_id + status.
-- O Postgres não cria índice automaticamente para FK, então sem isto era seq scan.
CREATE INDEX "payments_student_id_status_idx" ON "payments"("student_id", "status");

-- CreateIndex
-- Fila de pendentes (status) e arrecadação do mês (status + paid_at).
CREATE INDEX "payments_status_paid_at_idx" ON "payments"("status", "paid_at");
