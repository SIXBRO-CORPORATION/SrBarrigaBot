import {Injectable} from '@nestjs/common';
import {Payment as PrismaPayment} from '../../../generated/prisma/client.js';
import {Payment} from '../../domain/payment.js';

@Injectable()
export class PaymentMapper {
    toDomain(entity: PrismaPayment): Payment {
        const payment = new Payment();
        payment.id = entity.id;
        payment.studentId = entity.studentId;
        payment.amount = Number(entity.amount);
        payment.paidAt = entity.paidAt;
        payment.note = entity.note;
        payment.receiptUrl = entity.receiptUrl;
        payment.createdAt = entity.createdAt;
        payment.modifiedAt = entity.modifiedAt;
        payment.deletedAt = entity.deletedAt;
        return payment;
    }

    toEntity(domain: Payment): PrismaPayment {
        return {
            id: domain.id,
            studentId: domain.studentId,
            amount: domain.amount as any,
            paidAt: domain.paidAt,
            note: domain.note,
            receiptUrl: domain.receiptUrl,
            createdAt: domain.createdAt,
            modifiedAt: domain.modifiedAt,
            deletedAt: domain.deletedAt,
        };
    }
}
