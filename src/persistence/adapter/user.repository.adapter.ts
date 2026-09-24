import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from '../../core/persistence/user.repository.port.js';
import { User } from '../../domain/user.js';
import { PrismaConfiguration } from '../configuration/prisma.configuration.js';
import { UserMapper } from '../mapper/user.mapper.js';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
    constructor(
        private readonly prisma: PrismaConfiguration,
        private readonly mapper: UserMapper,
    ) {}

    async get(id: string): Promise<User | null> {
        const entity = await this.prisma.user.findFirst({
            where: { id, deletedAt: null },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<User[]> {
        const entities = await this.prisma.user.findMany({
            where: { deletedAt: null },
        });
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async save(model: User): Promise<User> {
        const data = this.mapper.toEntity(model);

        const saved = model.id
            ? await this.prisma.user.update({ where: { id: model.id }, data })
            : await this.prisma.user.create({ data });

        return this.mapper.toDomain(saved);
    }

    async delete(model: User): Promise<User> {
        const deleted = await this.prisma.user.delete({
            where: { id: model.id },
        });
        return this.mapper.toDomain(deleted);
    }

    async softDelete(model: User): Promise<User> {
        const deleted = await this.prisma.user.update({
            where: { id: model.id },
            data: { deletedAt: new Date() },
        });
        return this.mapper.toDomain(deleted);
    }

    async findByEmail(email: string): Promise<User | null> {
        const entity = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email, deletedAt: null },
        });
        return count > 0;
    }
}