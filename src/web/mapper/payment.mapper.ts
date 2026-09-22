import {Injectable} from '@nestjs/common';
import {Payment} from '../../domain/payment.js';
import {PaymentResponse} from '../model/response/payment.response.js';

@Injectable()
export class PaymentMapper {
    public toResponse(payment: Payment): PaymentResponse {
        return new PaymentResponse({
            id: payment.id,
            amount: payment.amount,
            paidAt: payment.paidAt,
            note: payment.note,
            receiptUrl: payment.receiptUrl,
            createdAt: payment.createdAt,
        });
    }
}
