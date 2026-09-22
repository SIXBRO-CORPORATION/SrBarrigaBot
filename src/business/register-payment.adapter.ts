import {Injectable} from '@nestjs/common';
import {RegisterPaymentPort} from '../core/business/register-payment.port.js';
import {Context} from '../core/context.js';
import {Payment} from '../domain/payment.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {UploadFilePort} from '../core/infrastructure/upload-file.port.js';
import {UploadFileInput} from '../domain/upload-file-input.js';

@Injectable()
export class RegisterPaymentAdapter implements RegisterPaymentPort {
    constructor(
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly uploadFilePort: UploadFilePort,
    ) {}

    async execute(context: Context): Promise<Payment> {
        const payment = context.getData(Payment);

        if (!payment) {
            throw new BusinessException('Por favor, informe os dados do pagamento.');
        }

        if (!payment.studentId || payment.studentId.trim() === '') {
            throw new BusinessException('Por favor, informe o aluno.');
        }

        const student = await this.studentRepositoryPort.get(payment.studentId);

        if (!student || student.deletedAt) {
            throw new BusinessException('Aluno não encontrado.');
        }

        if (payment.amount === undefined || payment.amount === null || isNaN(payment.amount) || payment.amount <= 0) {
            throw new BusinessException('Por favor, informe um valor de pagamento válido.');
        }

        if (!payment.paidAt || isNaN(new Date(payment.paidAt).getTime())) {
            throw new BusinessException('Por favor, informe a data do pagamento.');
        }

        let receiptKey: string | null = null;
        const fileInput = context.getProperty<UploadFileInput>('file');

        if (fileInput) {
            fileInput.folder = `comprovantes/${student.id}`;
            receiptKey = await this.uploadFilePort.execute(new Context(fileInput));
        }

        const newPayment = new Payment();
        newPayment.studentId = student.id;
        newPayment.amount = payment.amount;
        newPayment.paidAt = payment.paidAt;
        newPayment.note = payment.note?.trim() || null;
        newPayment.receiptUrl = receiptKey;
        newPayment.createdAt = new Date();
        newPayment.modifiedAt = new Date();

        return await this.paymentRepositoryPort.save(newPayment);
    }
}
