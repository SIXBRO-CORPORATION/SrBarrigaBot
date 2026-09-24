import {Injectable} from '@nestjs/common';
import {ListStudentsPort} from '../core/business/list-students.port.js';
import {Context} from '../core/context.js';
import {StudentSummary} from '../domain/student-summary.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {calculateBilling} from '../domain/calculations/billing.calculator.js';

@Injectable()
export class ListStudentsAdapter implements ListStudentsPort {
    constructor(
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
    ) {}

    async execute(_context: Context): Promise<StudentSummary[]> {
        const configs = await this.systemConfigRepositoryPort.findByKeys(['monthly_fee', 'billing_start_date']);
        const monthlyFeeConfig = configs.get('monthly_fee');
        const billingStartDateConfig = configs.get('billing_start_date');

        if (!monthlyFeeConfig || !billingStartDateConfig) {
            throw new BusinessException(
                'Configure a mensalidade e a data de início de cobrança em /config antes de consultar alunos.',
            );
        }

        const monthlyFee = Number(monthlyFeeConfig.value);
        const billingStartDate = new Date(billingStartDateConfig.value);
        const today = new Date();

        const students = await this.studentRepositoryPort.findAllActive();
        const paidByStudent = await this.paymentRepositoryPort.sumApprovedGroupedByStudent(
            students.map((student) => student.id),
        );

        const summaries: StudentSummary[] = [];

        for (const student of students) {
            const paidAmount = paidByStudent.get(student.id) ?? 0;
            const referenceDate = student.inactivatedAt ?? today;

            const billing = calculateBilling({
                monthlyFee,
                billingStartDate,
                referenceDate,
                paidAmount,
            });

            const summary = new StudentSummary();
            summary.student = student;
            summary.mesesDevidos = billing.mesesDevidos;
            summary.valorEsperadoAcumulado = billing.valorEsperadoAcumulado;
            summary.valorPagoAcumulado = billing.valorPagoAcumulado;
            summary.saldo = billing.saldo;
            summary.valorAtraso = billing.valorAtraso;
            summary.status = billing.status;

            summaries.push(summary);
        }

        return summaries;
    }
}
