import {Injectable} from '@nestjs/common';
import {GetDashboardSummaryPort} from '../core/business/get-dashboard-summary.port.js';
import {Context} from '../core/context.js';
import {DashboardSummary} from '../domain/dashboard-summary.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {EntryRepositoryPort} from '../core/persistence/entry.repository.port.js';
import {loadBillingConfig} from './utils/billing-config.js';
import {calculateClassTotals, round2} from '../domain/calculations/billing.calculator.js';

@Injectable()
export class GetDashboardSummaryAdapter implements GetDashboardSummaryPort {
    constructor(
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
        private readonly entryRepositoryPort: EntryRepositoryPort,
    ) {}

    async execute(_context: Context): Promise<DashboardSummary> {
        const {monthlyFee, billingStartDate} = await loadBillingConfig(this.systemConfigRepositoryPort, 'consultar o dashboard');
        const today = new Date();

        const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        const nextMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

        const [alunosAtivos, paid, arrecadadoNoMes, entries] = await Promise.all([
            this.studentRepositoryPort.countActive(),
            this.paymentRepositoryPort.sumApprovedTotals(),
            this.paymentRepositoryPort.sumApprovedPaidBetween(monthStart, nextMonthStart),
            this.entryRepositoryPort.sumByType(),
        ]);

        const {valorEsperadoTotal, valorContribuidoTotal} = calculateClassTotals({
            monthlyFee,
            billingStartDate,
            referenceDate: today,
            activeStudents: alunosAtivos,
            paidByActive: paid.active,
            paidByInactive: paid.inactive,
        });

        const summary = new DashboardSummary();
        summary.alunosAtivos = alunosAtivos;
        summary.mensalidade = round2(monthlyFee);
        summary.metaMensal = round2(monthlyFee * alunosAtivos);
        summary.arrecadadoNoMes = round2(arrecadadoNoMes);
        summary.valorEsperadoTotal = valorEsperadoTotal;
        // Lançamentos movem o total arrecadado, mas a diferença continua medindo só as mensalidades.
        summary.totalLucros = round2(entries.lucros);
        summary.totalGastos = round2(entries.gastos);
        summary.valorContribuidoTotal = round2(valorContribuidoTotal + entries.lucros - entries.gastos);
        summary.diferencaTotal = round2(valorContribuidoTotal - valorEsperadoTotal);

        return summary;
    }
}
