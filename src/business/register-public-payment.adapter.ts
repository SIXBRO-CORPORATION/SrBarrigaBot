import {Injectable} from '@nestjs/common';
import {RegisterPublicPaymentPort} from '../core/business/register-public-payment.port.js';
import {Context} from '../core/context.js';
import {Payment} from '../domain/payment.js';
import {PaymentStatus} from '../domain/payment-status.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {UploadFilePort} from '../core/infrastructure/upload-file.port.js';
import {UploadFileInput} from '../domain/upload-file-input.js';

@Injectable()
export class RegisterPublicPaymentAdapter implements RegisterPublicPaymentPort {
    constructor(
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly uploadFilePort: UploadFilePort,
    ) {}

    async execute(context: Context): Promise<Payment> {
        const matricula = context.getProperty<string>('matricula', String)?.trim();

        if (!matricula) {
            throw new BusinessException('Por favor, informe sua matrícula.');
        }

        const student = await this.studentRepositoryPort.findByMatricula(matricula);

        if (!student || student.deletedAt) {
            throw new BusinessException('Matrícula não encontrada. Verifique o número e tente novamente.');
        }

        const amount = context.getProperty<number>('amount', Number);

        if (amount === null || isNaN(amount) || amount <= 0) {
            throw new BusinessException('Por favor, informe um valor de pagamento válido.');
        }

        const paidAtRaw = context.getProperty<string>('paidAt', String);
        const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();

        if (isNaN(paidAt.getTime())) {
            throw new BusinessException('Por favor, informe uma data de pagamento válida.');
        }

        const note = context.getProperty<string>('note', String);

        const fileInput = context.getProperty<UploadFileInput>('file');

        if (!fileInput) {
            throw new BusinessException('Por favor, anexe o comprovante do Pix.');
        }

        fileInput.folder = `comprovantes/${student.id}`;
        const receiptKey = await this.uploadFilePort.execute(new Context(fileInput));

        const newPayment = new Payment();
        newPayment.studentId = student.id;
        newPayment.amount = amount;
        newPayment.paidAt = paidAt;
        newPayment.note = note?.trim() || null;
        newPayment.receiptUrl = receiptKey;
        newPayment.status = PaymentStatus.PENDING_APPROVAL;
        newPayment.approvedAt = null;
        newPayment.approvedBy = null;
        newPayment.rejectedReason = null;
        newPayment.createdAt = new Date();
        newPayment.modifiedAt = new Date();

        return await this.paymentRepositoryPort.save(newPayment);
    }
}
