import {Injectable} from '@nestjs/common';
import {Entry as PrismaEntry} from '../../../generated/prisma/client.js';
import {Entry} from '../../domain/entry.js';

@Injectable()
export class EntryMapper {
    toDomain(entity: PrismaEntry): Entry {
        const entry = new Entry();
        entry.id = entity.id;
        entry.type = entity.type;
        entry.title = entity.title;
        entry.details = entity.details;
        entry.amount = Number(entity.amount);
        entry.createdAt = entity.createdAt;
        entry.modifiedAt = entity.modifiedAt;
        entry.deletedAt = entity.deletedAt;
        return entry;
    }

    toEntity(domain: Entry): PrismaEntry {
        return {
            id: domain.id,
            type: domain.type,
            title: domain.title,
            details: domain.details,
            amount: domain.amount as any,
            createdAt: domain.createdAt,
            modifiedAt: domain.modifiedAt,
            deletedAt: domain.deletedAt,
        };
    }
}
