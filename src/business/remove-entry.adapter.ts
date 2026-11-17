import {Injectable} from '@nestjs/common';
import {RemoveEntryPort} from '../core/business/remove-entry.port.js';
import {Context} from '../core/context.js';
import {Entry} from '../domain/entry.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {EntryRepositoryPort} from '../core/persistence/entry.repository.port.js';

@Injectable()
export class RemoveEntryAdapter implements RemoveEntryPort {
    constructor(private readonly entryRepositoryPort: EntryRepositoryPort) {}

    async execute(context: Context): Promise<Entry> {
        const id = context.getProperty<string>('id', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o lançamento a ser removido.');
        }

        const existing = await this.entryRepositoryPort.get(id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Lançamento não encontrado.');
        }

        return await this.entryRepositoryPort.softDelete(existing);
    }
}
