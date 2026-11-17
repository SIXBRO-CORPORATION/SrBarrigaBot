import {Injectable} from '@nestjs/common';
import {UpdateEntryPort} from '../core/business/update-entry.port.js';
import {Context} from '../core/context.js';
import {Entry} from '../domain/entry.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {EntryRepositoryPort} from '../core/persistence/entry.repository.port.js';

@Injectable()
export class UpdateEntryAdapter implements UpdateEntryPort {
    constructor(private readonly entryRepositoryPort: EntryRepositoryPort) {}

    async execute(context: Context): Promise<Entry> {
        const patch = context.getData(Entry);

        if (!patch || !patch.id) {
            throw new BusinessException('Por favor, informe o lançamento a ser atualizado.');
        }

        const existing = await this.entryRepositoryPort.get(patch.id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Lançamento não encontrado.');
        }

        if (patch.type !== undefined) existing.type = patch.type;

        if (patch.title !== undefined) {
            if (patch.title.trim() === '') {
                throw new BusinessException('O título do lançamento não pode ficar vazio.');
            }
            existing.title = patch.title.trim();
        }

        if (patch.details !== undefined) existing.details = patch.details?.trim() || null;

        if (patch.amount !== undefined) {
            if (!(patch.amount > 0)) {
                throw new BusinessException('O valor do lançamento deve ser maior que zero.');
            }
            existing.amount = patch.amount;
        }

        return await this.entryRepositoryPort.save(existing);
    }
}
