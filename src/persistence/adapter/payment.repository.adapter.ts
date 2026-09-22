import {Injectable} from '@nestjs/common';
import {PaymentRepositoryPort} from '../../core/persistence/payment.repository.port.js';
import {Payment} from '../../domain/payment.js';
import {PrismaConfiguration} from '../configuration/prisma.configuration.js';
import {PaymentMapper} from '../mapper/payment.mapper.js';

@Injectable()
export class PaymentRepositoryAdapter implements PaymentRepositoryPort {
    constructor(
        private readonly prisma: PrismaConfiguration,
        private readonly mapper: PaymentMapper,
    ) {}

    async get(id: string): Promise<Payment | null> {
        const entity = await this.prisma.payment.findUnique({ where: { id } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Payment[]> {
        const entities = await this.prisma.payment.findMany();
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async findByStudentId(studentId: string): Promise<Payment[]> {
        const entities = await this.prisma.payment.findMany({
            where: { studentId, deletedAt: null },
            orderBy: { paidAt: 'asc' },
        });
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async save(model: Payment): Promise<Payment> {
        const data = this.mapper.toEntity(model);

        const saved = model.id
            ? await this.prisma.payment.update({ where: { id: model.id }, data })
            : await this.prisma.payment.create({ data });

        return this.mapper.toDomain(saved);
    }

    async delete(model: Payment): Promise<Payment> {
        const deleted = await this.prisma.payment.delete({
            where: { id: model.id },
        });
        return this.mapper.toDomain(deleted);
    }

    async softDelete(model: Payment): Promise<Payment> {
        const deleted = await this.prisma.payment.update({
            where: { id: model.id },
            data: { deletedAt: new Date() },
        });
        return this.mapper.toDomain(deleted);
    }
}
