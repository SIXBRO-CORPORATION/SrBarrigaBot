import {Injectable} from '@nestjs/common';
import {RejectPaymentPort} from '../core/business/reject-payment.port.js';
import {Context} from '../core/context.js';
import {Payment} from '../domain/payment.js';
import {PaymentStatus} from '../domain/payment-status.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';

@Injectable()
export class RejectPaymentAdapter implements RejectPaymentPort {
    constructor(private readonly paymentRepositoryPort: PaymentRepositoryPort) {}

    async execute(context: Context): Promise<Payment> {
        const id = context.getProperty<string>('id', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o pagamento a ser rejeitado.');
        }

        const existing = await this.paymentRepositoryPort.get(id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Pagamento não encontrado.');
        }

        if (existing.status !== PaymentStatus.PENDING_APPROVAL) {
            throw new BusinessException('Esse pagamento já foi analisado e não está mais pendente.');
        }

        const reason = context.getProperty<string>('reason', String);

        existing.status = PaymentStatus.REJECTED;
        existing.approvedAt = null;
        existing.approvedBy = null;
        existing.rejectedReason = reason?.trim() || 'Comprovante não confere.';

        return await this.paymentRepositoryPort.save(existing);
    }
}
