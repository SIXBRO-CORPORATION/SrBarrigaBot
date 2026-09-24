import {Injectable} from '@nestjs/common';
import {ListPendingPaymentsPort} from '../core/business/list-pending-payments.port.js';
import {Context} from '../core/context.js';
import {Payment} from '../domain/payment.js';
import {PaymentStatus} from '../domain/payment-status.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';

@Injectable()
export class ListPendingPaymentsAdapter implements ListPendingPaymentsPort {
    constructor(private readonly paymentRepositoryPort: PaymentRepositoryPort) {}

    async execute(_context: Context): Promise<Payment[]> {
        return await this.paymentRepositoryPort.findByStatus(PaymentStatus.PENDING_APPROVAL);
    }
}
