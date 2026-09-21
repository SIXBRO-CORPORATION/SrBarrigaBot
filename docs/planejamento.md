# Plano técnico — Gerenciamento de Alunos e Pagamentos (SrBarrigaBot)

## 1. Contexto

Hoje o `SrBarrigaBot` usa uma planilha do Google Sheets (`GoogleSheetsService` → `GetPeopleFromSheetPort`) como fonte de verdade para quem recebe o lembrete mensal (`ExecuteChargeAdapter`, disparado por cron ou manualmente via `POST /whatsapp/execute-charge`).

Esta feature substitui a planilha por um CRUD próprio: alunos e pagamentos passam a viver no banco (Postgres/Prisma), e o envio de mensagem passa a consumir esses dados diretamente.

**Trabalho em paralelo:** o settings de mensagem (texto/horário/dia de envio, hoje hardcoded) é feature de outra pessoa. Ponto de contato entre as duas frentes: tabela de configuração compartilhada e o formato dos dados que alimentam o template da mensagem (seção 6).

## 2. Modelo mental: saldo corrido, não "mensalidade do mês"

Pagamento aqui é livre — aluno pode pagar parcial, adiantar vários meses de uma vez, atrasar e depois quitar tudo junto. Por isso, em vez de vincular cada pagamento a um mês específico (o que exigiria conciliação manual toda vez), o sistema trata cada pagamento como um **lançamento solto** e calcula o status por mês a partir do saldo acumulado.

- Cada pagamento: `{ aluno, valor, data, observação, comprovante (opcional) }` — sem mês associado.
- Mensalidade: valor único, global, editável.
- Início de cobrança: uma data única para a turma toda (ex: `2025-01-01`), configurável.
- A partir disso, tudo é derivado (não persistido): quantos meses o aluno deve, quanto pagou, se está em dia, atrasado ou adiantado, e o status mês a mês.

## 3. Regras de cálculo

Variáveis globais: `mensalidade` (config), `inicioCobranca` (config), `hoje`.

Por aluno:

- `mesesDevidos` = meses entre `inicioCobranca` e (`hoje`, ou a data em que o aluno foi removido/inativado, o que vier primeiro).
- `valorEsperadoAcumulado` = `mesesDevidos × mensalidade`.
- `valorPagoAcumulado` = soma de todos os pagamentos não estornados do aluno.
- `saldo` = `valorPagoAcumulado − valorEsperadoAcumulado`.
  - `saldo < 0` → **atrasado**, `valorAtraso = abs(saldo)`.
  - `saldo > 0` → adiantado / crédito.
  - `saldo == 0` → em dia.
- `statusMesAMes`: para cada mês `i` de 1 até `mesesDevidos`, o mês é **OK** se `valorPagoAcumulado >= i × mensalidade`, senão **pendente**. Isso aloca o saldo automaticamente aos meses mais antigos primeiro (FIFO), sem precisar guardar qual pagamento "pagou" qual mês.

Nível da turma (dashboard):

- `metaMensal` = `mensalidade × nº de alunos ativos` (recalculado sempre, não é campo salvo).
- `arrecadadoNoMes` = soma dos pagamentos com `data` no mês corrente.
- `valorEsperadoTotal` = soma do `valorEsperadoAcumulado` de **todos** os alunos que já foram cobrados em algum momento (ativos e removidos — um aluno removido já gerou expectativa de pagamento até a data em que saiu).
- `valorContribuidoTotal` = soma de **todos** os pagamentos de **todos** os alunos, incluindo os removidos (histórico continua contando, conforme decidido).
- `diferencaTotal` = `valorContribuidoTotal − valorEsperadoTotal` → turma adiantada (positivo) ou atrasada (negativo) em relação ao ritmo esperado.

Cobertura das features pedidas:

| Feature pedida | Como é resolvida |
|---|---|
| Registro de valores por pessoa, ágil | `POST /students/:id/payments` — form rápido |
| Registro por meses | `statusMesAMes`, derivado |
| Quanto $ de atraso | `valorAtraso` por aluno |
| Check status por mês (pendente/OK) | `statusMesAMes` |
| Meta mensal | `metaMensal`, computado |
| Valor de atribuições x valor que deveria atingir | `valorContribuidoTotal` x `valorEsperadoTotal` |
| Adicionar/remover alunos | CRUD `Student` (soft delete) |

## 4. Modelo de dados (Prisma)

```prisma
model Student {
  id            String    @id @default(uuid())
  name          String
  phone         String
  active        Boolean   @default(true)
  inactivatedAt DateTime? @map("inactivated_at") // marca quando parou de ser cobrado
  createdAt     DateTime  @default(now()) @map("created_at")
  modifiedAt    DateTime  @updatedAt @map("modified_at")
  deletedAt     DateTime? @map("deleted_at")

  payments      Payment[]

  @@map("students")
}

model Payment {
  id         String    @id @default(uuid())
  studentId  String    @map("student_id")
  student    Student   @relation(fields: [studentId], references: [id])
  amount     Decimal   @db.Decimal(10, 2)
  paidAt     DateTime  @map("paid_at")
  note       String?
  receiptUrl String?   @map("receipt_url") // link do comprovante (imagem/PDF), opcional
  createdAt  DateTime  @default(now()) @map("created_at")
  modifiedAt DateTime  @updatedAt @map("modified_at")
  deletedAt  DateTime? @map("deleted_at") // permite estornar sem perder auditoria

  @@map("payments")
}

// Compartilhada com a feature de settings do parceiro (mensalidade, início
// de cobrança, texto/horário de mensagem, etc.) — evita duas tabelas de config.
model SystemConfig {
  id         String   @id @default(uuid())
  key        String   @unique
  value      String
  modifiedAt DateTime @updatedAt @map("modified_at")

  @@map("system_config")
}
```

Chaves de `SystemConfig` para esta feature: `monthly_fee`, `billing_start_date`.

### 4.1 Onde o arquivo do comprovante fica salvo

`receiptUrl` guarda só o **link** — o arquivo em si (foto do comprovante, print do Pix, PDF) não vai pro Postgres. Precisa de um lugar de armazenamento de arquivo por trás disso. Duas opções, do mais simples ao mais robusto:

- **v1 simples**: salvar no disco do próprio servidor, em um volume Docker persistente (o `docker-compose.yaml` já tem volumes configurados), servido como arquivo estático pelo Nest. Funciona bem pro volume de uso atual, mas amarra o arquivo à máquina — cuidado em caso de migração/redeploy sem volume persistente.
- **Recomendado a médio prazo**: object storage compatível com S3 (Cloudflare R2, AWS S3, Backblaze B2). Mais barato, durável e desacoplado do servidor. Vale a pena já nascer assim se o esforço de setup for baixo.

Proponho um `UploadFilePort` (`core/infrastructure`) com uma única implementação por trás — troca de v1 simples pra object storage depois sem tocar no resto do sistema.

## 5. Camadas (seguindo o padrão hexagonal já existente no repo)

Referência de padrão: `User` (`core/persistence/user.repository.port.ts` → `persistence/adapter/user.repository.adapter.ts` → `persistence/mapper/user.mapper.ts`) e `CreateUserPort`/`CreateUserAdapter`.

**`core/domain`**
- `Student`, `Payment` (classes de domínio, iguais ao padrão de `User`)

**`core/persistence`**
- `StudentRepositoryPort extends BaseRepositoryPort<Student>` + `findAllActive()`, `softDelete()`
- `PaymentRepositoryPort extends BaseRepositoryPort<Payment>` + `findByStudentId()`, `findByMonth()`
- `SystemConfigRepositoryPort` + `get(key)`, `set(key, value)`

**`core/business`** (ports)
- `CreateStudentPort`, `UpdateStudentPort`, `RemoveStudentPort`
- `ListStudentsPort` (retorna alunos já com `saldo`, `valorAtraso`, `status` calculados)
- `GetStudentDetailPort` (aluno + `statusMesAMes` + histórico de pagamentos)
- `RegisterPaymentPort` (recebe valor/data/nota + opcionalmente um arquivo, usa `UploadFilePort` pra gerar o `receiptUrl`), `RemovePaymentPort` (estorno)
- `GetDashboardSummaryPort` (`metaMensal`, `arrecadadoNoMes`, `valorEsperadoTotal`, `valorContribuidoTotal`, `diferencaTotal`)

**`business/*.adapter.ts`**
- Implementações dos ports acima, seguindo o padrão de `CreateUserAdapter` (valida via `BusinessException`, usa `Context`).
- Extrair a lógica de saldo/status/timeline (seção 3) para uma função pura em `domain/calculations/billing.calculator.ts`, sem dependência de infra — testável isoladamente e reaproveitável entre `ListStudentsPort`, `GetStudentDetailPort` e `GetDashboardSummaryPort`.

**`persistence/adapter`**
- `StudentRepositoryAdapter`, `PaymentRepositoryAdapter`, `SystemConfigRepositoryAdapter` (Prisma), com seus respectivos `mapper`.

**`web/controller`**
- `StudentController`, `PaymentController`, `DashboardController`, `ConfigController` — todos com `@UseGuards(JwtAuthGuard)`, seguindo `UserController`/`WhatsAppController`.

## 6. Integração com o envio de WhatsApp

`ExecuteChargeAdapter` hoje depende de `GetPeopleFromSheetPort`. Troca por um novo port, ex. `GetChargeablePeoplePort`, implementado usando `StudentRepositoryPort` + `billing.calculator`, retornando por aluno ativo: `nome`, `telefone`, `mesAtual`, `valorAtraso`, `statusMesAtual`.

Isso permite mensagens mais ricas (ex: citar o valor em atraso) sem a feature de alunos precisar mexer no template — só define o *shape* dos dados disponíveis. **Alinhar com o parceiro** qual desses campos o template de settings vai querer usar como variável.

## 7. API proposta

```
POST   /students                     criar aluno
GET    /students                     listar (com saldo/status calculado)
GET    /students/:id                 detalhe + timeline + histórico
PATCH  /students/:id                 editar nome/telefone
DELETE /students/:id                 remover (soft delete, seta inactivatedAt)

POST   /students/:id/payments        registrar pagamento (multipart: valor, data, nota, comprovante opcional)
GET    /students/:id/payments        histórico de pagamentos do aluno
DELETE /payments/:id                 estornar lançamento

GET    /students/:id/timeline        status mês a mês (grid)

GET    /dashboard/summary            meta mensal, arrecadado no mês, esperado x contribuído total

GET    /config                       mensalidade, data de início (+ configs do parceiro)
PATCH  /config
```

## 8. Frontend (`SrBarrigaBotWeb`)

- Nova rota `/students` (ou `/alunos`) na `Sidebar`.
- **Lista de alunos**: nome, saldo (badge verde = em dia/adiantado, vermelho = atraso com valor), ação rápida de registrar pagamento.
- **Modal de registro rápido**: buscar aluno, valor, data (default hoje), observação opcional, anexo de comprovante opcional (foto/PDF) — otimizado pra poucos cliques.
- **Detalhe do aluno**: grid mês a mês (`statusMesAMes`), histórico de pagamentos com opção de ver/baixar comprovante, estornar, editar/remover aluno.
- **Dashboard** (`app/(home)/page.tsx`): novos cards — meta mensal, arrecadado no mês corrente, valor esperado total x contribuído total (com a diferença em destaque).
- Seguir o design system existente (`chamfer`, `tech-text`, `Modal`, `Button`, `Loading` de `components/ui`).
- Novo `services/student.service.ts` e `services/payment.service.ts` (padrão de `whatsapp.service.ts`), novos `types/student.ts`, `types/payment.ts` (padrão de `types/whatsapp.ts`).

## 9. Fora de escopo (v1)

- Data de encerramento automático da cobrança (formatura) — por enquanto, desativação manual do aluno quando for o caso.
- Vincular pagamento a um mês específico manualmente — desnecessário dado o modelo de saldo corrido.

## 10. Coordenação com a feature de Settings (parceiro)

- **`SystemConfig`** é compartilhada — combinar nomenclatura de chaves antes de implementar, pra não sair cada um criando sua própria tabela de config.
- **`ConfigController`** pode nascer como um único controller pros dois conjuntos de configs, ou dois controllers sobre a mesma tabela — decidir junto.
- O `GetChargeablePeoplePort` (seção 6) é o contrato entre as duas features: definir junto quais campos o template de mensagem vai consumir.
