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
        const monthlyFeeConfig = await this.systemConfigRepositoryPort.get('monthly_fee');
        const billingStartDateConfig = await this.systemConfigRepositoryPort.get('billing_start_date');

        if (!monthlyFeeConfig || !billingStartDateConfig) {
            throw new BusinessException(
                'Configure a mensalidade e a data de início de cobrança em /config antes de consultar o dashboard.',
            );
        }

        const monthlyFee = Number(monthlyFeeConfig.value);
        const billingStartDate = new Date(billingStartDateConfig.value);
        const today = new Date();

        const allStudents = await this.studentRepositoryPort.findAll();

        let alunosAtivos = 0;
        let valorEsperadoTotal = 0;
        let valorContribuidoTotal = 0;
        let arrecadadoNoMes = 0;

        for (const student of allStudents) {
            if (student.active) {
                alunosAtivos++;
            }

            const payments = await this.paymentRepositoryPort.findByStudentId(student.id);
            const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const referenceDate = student.inactivatedAt ?? today;

            const billing = calculateBilling({
                monthlyFee,
                billingStartDate,
                referenceDate,
                paidAmount,
            });

            valorEsperadoTotal += billing.valorEsperadoAcumulado;
            valorContribuidoTotal += billing.valorPagoAcumulado;

            for (const payment of payments) {
                const paidAt = new Date(payment.paidAt);
                if (paidAt.getUTCFullYear() === today.getUTCFullYear() && paidAt.getUTCMonth() === today.getUTCMonth()) {
                    arrecadadoNoMes += payment.amount;
                }
            }
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
