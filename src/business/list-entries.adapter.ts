import {Injectable} from '@nestjs/common';
import {ListEntriesPort} from '../core/business/list-entries.port.js';
import {Context} from '../core/context.js';
import {Entry} from '../domain/entry.js';
import {EntryRepositoryPort} from '../core/persistence/entry.repository.port.js';

@Injectable()
export class ListEntriesAdapter implements ListEntriesPort {
    constructor(private readonly entryRepositoryPort: EntryRepositoryPort) {}

    async execute(_context: Context): Promise<Entry[]> {
        return await this.entryRepositoryPort.findAll();
    }
}
