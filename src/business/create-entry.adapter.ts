import {Injectable} from '@nestjs/common';
import {CreateEntryPort} from '../core/business/create-entry.port.js';
import {Context} from '../core/context.js';
import {Entry} from '../domain/entry.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {EntryRepositoryPort} from '../core/persistence/entry.repository.port.js';

@Injectable()
export class CreateEntryAdapter implements CreateEntryPort {
    constructor(private readonly entryRepositoryPort: EntryRepositoryPort) {}

    async execute(context: Context): Promise<Entry> {
        const entry = context.getData(Entry);

        if (!entry || !entry.title?.trim()) {
            throw new BusinessException('Por favor, informe o título do lançamento.');
        }

        if (!(entry.amount > 0)) {
            throw new BusinessException('O valor do lançamento deve ser maior que zero.');
        }

        entry.title = entry.title.trim();
        entry.details = entry.details?.trim() || null;

        return await this.entryRepositoryPort.save(entry);
    }
}
