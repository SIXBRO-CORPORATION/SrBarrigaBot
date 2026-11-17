import {AbstractDomain} from './abstract.domain.js';

export type EntryType = 'GASTO' | 'LUCRO';

export class Entry extends AbstractDomain {
    type: EntryType;
    title: string;
    details: string | null;
    amount: number;
}
