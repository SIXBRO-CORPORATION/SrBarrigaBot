-- Matrícula passa a ser única entre TODOS os alunos (ativos e removidos).
-- Cadastrar uma matrícula que já existe reativa o registro removido (mantém o histórico de pagamentos)
-- em vez de criar um aluno novo. Por isso o índice parcial (deleted_at IS NULL) deixa de servir.
-- ATENÇÃO: falha (e reverte tudo) se já houver matrícula repetida entre um aluno ativo e um removido.
-- Para achar: SELECT matricula FROM students GROUP BY matricula HAVING count(*) > 1;

-- DropIndex
DROP INDEX "students_matricula_active_key";

-- CreateIndex
CREATE UNIQUE INDEX "students_matricula_key" ON "students"("matricula");
