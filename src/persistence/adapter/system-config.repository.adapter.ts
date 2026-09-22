import {Injectable} from '@nestjs/common';
import {SystemConfigRepositoryPort} from '../../core/persistence/system-config.repository.port.js';
import {SystemConfig} from '../../domain/system-config.js';
import {PrismaConfiguration} from '../configuration/prisma.configuration.js';
import {SystemConfigMapper} from '../mapper/system-config.mapper.js';

@Injectable()
export class SystemConfigRepositoryAdapter implements SystemConfigRepositoryPort {
    constructor(
        private readonly prisma: PrismaConfiguration,
        private readonly mapper: SystemConfigMapper,
    ) {}

    async findAll(): Promise<SystemConfig[]> {
        const entities = await this.prisma.systemConfig.findMany({
            orderBy: { key: 'asc' },
        });
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async get(key: string): Promise<SystemConfig | null> {
        const entity = await this.prisma.systemConfig.findUnique({ where: { key } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async set(key: string, value: string): Promise<SystemConfig> {
        const entity = await this.prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
        return this.mapper.toDomain(entity);
    }
}
