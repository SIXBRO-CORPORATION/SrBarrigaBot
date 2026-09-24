import {Injectable} from '@nestjs/common';
import {Payment as PrismaPayment} from '../../../generated/prisma/client.js';
import {Payment} from '../../domain/payment.js';

@Injectable()
export class PaymentMapper {
    toDomain(entity: PrismaPayment & { student?: { name: string } | null }): Payment {
        const payment = new Payment();
        payment.id = entity.id;
        payment.studentId = entity.studentId;
        payment.amount = Number(entity.amount);
        payment.paidAt = entity.paidAt;
        payment.note = entity.note;
        payment.receiptUrl = entity.receiptUrl;
        payment.status = entity.status as any;
        payment.approvedAt = entity.approvedAt;
        payment.approvedBy = entity.approvedBy;
        payment.rejectedReason = entity.rejectedReason;
        payment.createdAt = entity.createdAt;
        payment.modifiedAt = entity.modifiedAt;
        payment.deletedAt = entity.deletedAt;
        payment.studentName = entity.student?.name;
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
            status: domain.status as any,
            approvedAt: domain.approvedAt,
            approvedBy: domain.approvedBy,
            rejectedReason: domain.rejectedReason,
            createdAt: domain.createdAt,
            modifiedAt: domain.modifiedAt,
            deletedAt: domain.deletedAt,
        };
    }
}
