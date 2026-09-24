import {Injectable} from '@nestjs/common';
import {GetStudentDetailPort} from '../core/business/get-student-detail.port.js';
import {Context} from '../core/context.js';
import {StudentDetail} from '../domain/student-detail.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {calculateBilling} from '../domain/calculations/billing.calculator.js';
import {PaymentStatus} from '../domain/payment-status.js';

@Injectable()
export class GetStudentDetailAdapter implements GetStudentDetailPort {
    constructor(
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
    ) {}

    async execute(context: Context): Promise<StudentDetail> {
        const id = context.getProperty<string>('id', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o aluno.');
        }

        const student = await this.studentRepositoryPort.get(id);

        if (!student || student.deletedAt) {
            throw new BusinessException('Aluno não encontrado.');
        }

        const monthlyFeeConfig = await this.systemConfigRepositoryPort.get('monthly_fee');
        const billingStartDateConfig = await this.systemConfigRepositoryPort.get('billing_start_date');

        if (!monthlyFeeConfig || !billingStartDateConfig) {
            throw new BusinessException(
                'Configure a mensalidade e a data de início de cobrança em /config antes de consultar alunos.',
            );
        }

        const monthlyFee = Number(monthlyFeeConfig.value);
        const billingStartDate = new Date(billingStartDateConfig.value);
        const today = new Date();
        
        const payments = await this.paymentRepositoryPort.findByStudentId(student.id);
        const paidAmount = payments
            .filter((payment) => payment.status === PaymentStatus.APPROVED)
            .reduce((sum, payment) => sum + payment.amount, 0);
        const referenceDate = student.inactivatedAt ?? today;

        const billing = calculateBilling({
            monthlyFee,
            billingStartDate,
            referenceDate,
            paidAmount,
        });

        const detail = new StudentDetail();
        detail.student = student;
        detail.mesesDevidos = billing.mesesDevidos;
        detail.valorEsperadoAcumulado = billing.valorEsperadoAcumulado;
        detail.valorPagoAcumulado = billing.valorPagoAcumulado;
        detail.saldo = billing.saldo;
        detail.valorAtraso = billing.valorAtraso;
        detail.status = billing.status;
        detail.statusMesAMes = billing.statusMesAMes;
        detail.payments = payments;

        return detail;
    }
}
