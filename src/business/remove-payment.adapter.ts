import {Injectable} from '@nestjs/common';
import {RemovePaymentPort} from '../core/business/remove-payment.port.js';
import {Context} from '../core/context.js';
import {Payment} from '../domain/payment.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';

@Injectable()
export class RemovePaymentAdapter implements RemovePaymentPort {
    constructor(private readonly paymentRepositoryPort: PaymentRepositoryPort) {}

    async execute(context: Context): Promise<Payment> {
        const id = context.getProperty<string>('id', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o pagamento a ser estornado.');
        }

        const existing = await this.paymentRepositoryPort.get(id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Pagamento não encontrado.');
        }

        return await this.paymentRepositoryPort.softDelete(existing);
    }
}
