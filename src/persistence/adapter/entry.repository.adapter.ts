import {Injectable} from '@nestjs/common';
import {EntryRepositoryPort} from '../../core/persistence/entry.repository.port.js';
import {Entry} from '../../domain/entry.js';
import {PrismaConfiguration} from '../configuration/prisma.configuration.js';
import {EntryMapper} from '../mapper/entry.mapper.js';

@Injectable()
export class EntryRepositoryAdapter implements EntryRepositoryPort {
    constructor(
        private readonly prisma: PrismaConfiguration,
        private readonly mapper: EntryMapper,
    ) {}

    async get(id: string): Promise<Entry | null> {
        const entity = await this.prisma.entry.findFirst({where: {id, deletedAt: null}});
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Entry[]> {
        const entities = await this.prisma.entry.findMany({where: {deletedAt: null}, orderBy: {createdAt: 'desc'}});
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async sumByType(): Promise<{ gastos: number; lucros: number }> {
        const rows = await this.prisma.entry.groupBy({by: ['type'], where: {deletedAt: null}, _sum: {amount: true}});
        const sum = (type: string) => Number(rows.find((r) => r.type === type)?._sum.amount ?? 0);
        return {gastos: sum('GASTO'), lucros: sum('LUCRO')};
    }

    async save(model: Entry): Promise<Entry> {
        const data = this.mapper.toEntity(model);

        const saved = model.id
            ? await this.prisma.entry.update({where: {id: model.id}, data: {...data, modifiedAt: new Date()}})
            : await this.prisma.entry.create({data});

        return this.mapper.toDomain(saved);
    }

    async delete(model: Entry): Promise<Entry> {
        return this.mapper.toDomain(await this.prisma.entry.delete({where: {id: model.id}}));
    }

    async softDelete(model: Entry): Promise<Entry> {
        const deleted = await this.prisma.entry.update({where: {id: model.id}, data: {deletedAt: new Date()}});
        return this.mapper.toDomain(deleted);
    }
}
