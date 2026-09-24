import {Injectable} from '@nestjs/common';
import {ApprovePaymentPort} from '../core/business/approve-payment.port.js';
import {Context} from '../core/context.js';
import {Payment} from '../domain/payment.js';
import {PaymentStatus} from '../domain/payment-status.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';

@Injectable()
export class ApprovePaymentAdapter implements ApprovePaymentPort {
    constructor(private readonly paymentRepositoryPort: PaymentRepositoryPort) {}

    async execute(context: Context): Promise<Payment> {
        const id = context.getProperty<string>('id', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o pagamento a ser aprovado.');
        }

        const existing = await this.paymentRepositoryPort.get(id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Pagamento não encontrado.');
        }

        if (existing.status !== PaymentStatus.PENDING_APPROVAL) {
            throw new BusinessException('Esse pagamento já foi analisado e não está mais pendente.');
        }

        const approvedBy = context.getProperty<string>('approvedBy', String);

        existing.status = PaymentStatus.APPROVED;
        existing.approvedAt = new Date();
        existing.approvedBy = approvedBy;
        existing.rejectedReason = null;

        return await this.paymentRepositoryPort.save(existing);
    }
}
