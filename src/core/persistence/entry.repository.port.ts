import {BaseRepositoryPort} from './commons/base.repository.port.js';
import {Entry} from '../../domain/entry.js';

export abstract class EntryRepositoryPort extends BaseRepositoryPort<Entry> {
    abstract sumByType(): Promise<{ gastos: number; lucros: number }>;
}
