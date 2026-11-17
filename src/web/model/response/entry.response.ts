export class EntryResponse {
    id: string;
    type: string;
    title: string;
    details: string | null;
    amount: number;
    createdAt: Date;

    constructor(partial: Partial<EntryResponse>) {
        Object.assign(this, partial);
    }
}
