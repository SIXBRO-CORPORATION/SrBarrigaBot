export type ChargeStatus = 'idle' | 'running' | 'completed' | 'failed';

export class ChargeProgress {
    status: ChargeStatus = 'idle';
    total: number = 0;
    sent: number = 0;
    failed: number = 0;
    error?: string;
    startedAt?: string;
    finishedAt?: string;
}
