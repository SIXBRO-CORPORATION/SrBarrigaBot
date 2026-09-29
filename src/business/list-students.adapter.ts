import {Injectable} from '@nestjs/common';
import {ListStudentsPort} from '../core/business/list-students.port.js';
import {Context} from '../core/context.js';
import {StudentSummary} from '../domain/student-summary.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {loadBillingConfig} from './utils/billing-config.js';
import {calculateBilling} from '../domain/calculations/billing.calculator.js';

@Injectable()
export class ListStudentsAdapter implements ListStudentsPort {
    constructor(
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
    ) {}

    async execute(_context: Context): Promise<StudentSummary[]> {
        const {monthlyFee, billingStartDate} = await loadBillingConfig(this.systemConfigRepositoryPort, 'consultar alunos');
        const today = new Date();

        const [students, paidByStudent] = await Promise.all([
            this.studentRepositoryPort.findAllActive(),
            this.paymentRepositoryPort.sumApprovedGroupedByActiveStudent(),
        ]);

        const summaries: StudentSummary[] = [];

        for (const student of students) {
            const paidAmount = paidByStudent.get(student.id) ?? 0;

            const billing = calculateBilling({
                monthlyFee,
                billingStartDate,
                referenceDate: today,
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
