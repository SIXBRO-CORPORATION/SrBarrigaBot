import {AbstractDomain} from './abstract.domain.js';

export class Payment extends AbstractDomain {
    studentId: string;
    amount: number;
    paidAt: Date;
    note: string | null;
    receiptUrl: string | null;
}
