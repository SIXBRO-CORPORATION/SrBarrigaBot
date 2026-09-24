import {Injectable} from '@nestjs/common';
import {GetDashboardSummaryPort} from '../core/business/get-dashboard-summary.port.js';
import {Context} from '../core/context.js';
import {DashboardSummary} from '../domain/dashboard-summary.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
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
        const configs = await this.systemConfigRepositoryPort.findByKeys(['monthly_fee', 'billing_start_date']);
        const monthlyFeeConfig = configs.get('monthly_fee');
        const billingStartDateConfig = configs.get('billing_start_date');

        if (!monthlyFeeConfig || !billingStartDateConfig) {
            throw new BusinessException(
                'Configure a mensalidade e a data de início de cobrança em /config antes de consultar o dashboard.',
            );
        }

        const monthlyFee = Number(monthlyFeeConfig.value);
        const billingStartDate = new Date(billingStartDateConfig.value);
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
