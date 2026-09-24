import {BaseRepositoryPort} from './commons/base.repository.port.js';
import {Payment} from '../../domain/payment.js';
import {PaymentStatus} from '../../domain/payment-status.js';

export abstract class PaymentRepositoryPort extends BaseRepositoryPort<Payment> {
    abstract findByStudentId(studentId: string): Promise<Payment[]>;
    abstract findByStatus(status: PaymentStatus): Promise<Payment[]>;
    abstract sumApprovedGroupedByStudent(studentIds?: string[]): Promise<Map<string, number>>;
    abstract sumApprovedByStudentId(studentId: string): Promise<number>;
    abstract sumApprovedPaidBetween(from: Date, toExclusive: Date): Promise<number>;
}
