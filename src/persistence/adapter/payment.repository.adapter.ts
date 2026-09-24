import { Injectable } from '@nestjs/common';
import { PaymentRepositoryPort } from '../../core/persistence/payment.repository.port.js';
import { Payment } from '../../domain/payment.js';
import { PrismaConfiguration } from '../configuration/prisma.configuration.js';
import { PaymentMapper } from '../mapper/payment.mapper.js';
import { PaymentStatus } from '../../domain/payment-status.js';
import { PaymentStatus as PrismaPaymentStatus } from '../../../generated/prisma/enums.js';

@Injectable()
export class PaymentRepositoryAdapter implements PaymentRepositoryPort {
    constructor(
        private readonly prisma: PrismaConfiguration,
        private readonly mapper: PaymentMapper,
    ) {}

    async get(id: string): Promise<Payment | null> {
        const entity = await this.prisma.payment.findFirst({
            where: { id, deletedAt: null },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Payment[]> {
        const entities = await this.prisma.payment.findMany({
            where: { deletedAt: null },
        });
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async findByStudentId(studentId: string): Promise<Payment[]> {
        const entities = await this.prisma.payment.findMany({
            where: { studentId, deletedAt: null },
            orderBy: { paidAt: 'asc' },
        });
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async findByStatus(status: PaymentStatus): Promise<Payment[]> {
        const entities = await this.prisma.payment.findMany({
            where: { status: status as any, deletedAt: null },
            orderBy: { createdAt: 'asc' },
            include: { student: { select: { name: true } } },
        });
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async sumApprovedGroupedByStudent(studentIds?: string[]): Promise<Map<string, number>> {
        const rows = await this.prisma.payment.groupBy({
            by: ['studentId'],
            where: {
                status: PrismaPaymentStatus.APPROVED,
                deletedAt: null,
                ...(studentIds ? { studentId: { in: studentIds } } : {}),
            },
            _sum: { amount: true },
        });
        return new Map(rows.map((row) => [row.studentId, Number(row._sum.amount ?? 0)]));
    }

    async sumApprovedByStudentId(studentId: string): Promise<number> {
        const result = await this.prisma.payment.aggregate({
            where: { studentId, status: PrismaPaymentStatus.APPROVED, deletedAt: null },
            _sum: { amount: true },
        });
        return Number(result._sum.amount ?? 0);
    }

    async sumApprovedPaidBetween(from: Date, toExclusive: Date): Promise<number> {
        const result = await this.prisma.payment.aggregate({
            where: {
                status: PrismaPaymentStatus.APPROVED,
                deletedAt: null,
                paidAt: { gte: from, lt: toExclusive },
            },
            _sum: { amount: true },
        });
        return Number(result._sum.amount ?? 0);
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