import {BaseRepositoryPort} from './commons/base.repository.port.js';
import {Payment} from '../../domain/payment.js';

export abstract class PaymentRepositoryPort extends BaseRepositoryPort<Payment> {
    abstract findByStudentId(studentId: string): Promise<Payment[]>;
}
