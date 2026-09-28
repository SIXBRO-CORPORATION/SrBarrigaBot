import {Injectable} from '@nestjs/common';
import {GetDashboardSummaryPort} from '../core/business/get-dashboard-summary.port.js';
import {Context} from '../core/context.js';
import {DashboardSummary} from '../domain/dashboard-summary.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {loadBillingConfig} from './utils/billing-config.js';
import {calculateBilling} from '../domain/calculations/billing.calculator.js';
import {round2} from '../domain/calculations/billing.calculator.js'

@Injectable()
export class GetDashboardSummaryAdapter implements GetDashboardSummaryPort {
    constructor(
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
    ) {}

    async execute(_context: Context): Promise<DashboardSummary> {
        const {monthlyFee, billingStartDate} = await loadBillingConfig(this.systemConfigRepositoryPort, 'consultar o dashboard');
        const today = new Date();

        const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        const nextMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

        const [alunosAtivos, allStudents, paidByStudent, arrecadadoNoMes] = await Promise.all([
            this.studentRepositoryPort.countActive(),
            this.studentRepositoryPort.findAllIncludingDeleted(),
            this.paymentRepositoryPort.sumApprovedGroupedByStudent(),
            this.paymentRepositoryPort.sumApprovedPaidBetween(monthStart, nextMonthStart),
        ]);

        let valorEsperadoTotal = 0;
        let valorContribuidoTotal = 0;

        for (const student of allStudents) {
            const billing = calculateBilling({
                monthlyFee,
                billingStartDate,
                referenceDate: student.inactivatedAt ?? today,
                paidAmount: paidByStudent.get(student.id) ?? 0,
            });

            valorEsperadoTotal += billing.valorEsperadoAcumulado;
            valorContribuidoTotal += billing.valorPagoAcumulado;
        }

        const summary = new DashboardSummary();
        summary.alunosAtivos = alunosAtivos;
        summary.mensalidade = round2(monthlyFee);
        summary.metaMensal = round2(monthlyFee * alunosAtivos);
        summary.arrecadadoNoMes = round2(arrecadadoNoMes);
        summary.valorEsperadoTotal = round2(valorEsperadoTotal);
        summary.valorContribuidoTotal = round2(valorContribuidoTotal);
        summary.diferencaTotal = round2(valorContribuidoTotal - valorEsperadoTotal);

        return summary;
    }
}
