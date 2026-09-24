import {Injectable} from '@nestjs/common';
import {Payment} from '../../domain/payment.js';
import {PaymentResponse} from '../model/response/payment.response.js';
import {GetFileSignedUrlPort} from '../../core/infrastructure/get-file-signed-url.port.js';
import {Context} from '../../core/context.js';
import {StudentRepositoryPort} from '../../core/persistence/student.repository.port.js';

@Injectable()
export class PaymentMapper {
    constructor(
        private readonly getFileSignedUrlPort: GetFileSignedUrlPort,
        private readonly studentRepositoryPort: StudentRepositoryPort,
    ) {}

    public async toResponse(payment: Payment, includeStudentName = false): Promise<PaymentResponse> {
        const studentName = includeStudentName
            ? (await this.studentRepositoryPort.get(payment.studentId))?.name
            : undefined;

        return new PaymentResponse({
            id: payment.id,
            studentId: payment.studentId,
            studentName,
            amount: payment.amount,
            paidAt: payment.paidAt,
            note: payment.note,
            receiptUrl: await this.resolveReceiptUrl(payment.receiptUrl),
            status: payment.status,
            approvedAt: payment.approvedAt,
            rejectedReason: payment.rejectedReason,
            createdAt: payment.createdAt,
        });
    }

    private async resolveReceiptUrl(receiptKey: string | null): Promise<string | null> {
        if (!receiptKey) {
            return null;
        }

        const context = new Context();
        context.putProperty('key', receiptKey);

        return await this.getFileSignedUrlPort.execute(context);
    }
}
