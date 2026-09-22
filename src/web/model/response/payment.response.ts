export class PaymentResponse {
    id: string;
    amount: number;
    paidAt: Date;
    note: string | null;
    receiptUrl: string | null;
    createdAt: Date;

    constructor(partial: Partial<PaymentResponse>) {
        Object.assign(this, partial);
    }
}
