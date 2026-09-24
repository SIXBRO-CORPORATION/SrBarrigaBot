import {AbstractDomain} from './abstract.domain.js';
import {PaymentStatus} from './payment-status.js';

export class Payment extends AbstractDomain {
    studentId: string;
    amount: number;
    paidAt: Date;
    note: string | null;
    receiptUrl: string | null;
    status: PaymentStatus;
    approvedAt: Date | null;
    approvedBy: string | null;
    rejectedReason: string | null;
    studentName?: string;
}
