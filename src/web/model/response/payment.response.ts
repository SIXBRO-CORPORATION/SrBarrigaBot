export class PaymentResponse {
    id: string;
    studentId: string;
    studentName?: string;
    amount: number;
    paidAt: Date;
    note: string | null;
    receiptUrl: string | null;
    status: string;
    approvedAt: Date | null;
    rejectedReason: string | null;
    createdAt: Date;

    constructor(partial: Partial<PaymentResponse>) {
        Object.assign(this, partial);
    }
}
