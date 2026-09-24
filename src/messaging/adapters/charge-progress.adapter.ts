import {Injectable} from '@nestjs/common';
import {EventEmitter} from 'events';
import {ChargeProgressPort} from '../../core/messaging/charge-progress.port.js';
import {ChargeProgress} from '../../domain/charge-progress.js';

const CHANGE_EVENT = 'change';

@Injectable()
export class ChargeProgressAdapter implements ChargeProgressPort {
    private readonly emitter = new EventEmitter();
    private state: ChargeProgress = new ChargeProgress();

    getState(): ChargeProgress {
        return {...this.state};
    }

    isRunning(): boolean {
        return this.state.status === 'running';
    }

    start(): boolean {
        if (this.isRunning()) {
            return false;
        }

        this.state = Object.assign(new ChargeProgress(), {
            status: 'running',
            startedAt: new Date().toISOString(),
        });
        this.notify();
        return true;
    }

    setTotal(total: number): void {
        this.update({total});
    }

    reportSent(): void {
        this.update({sent: this.state.sent + 1});
    }

    reportFailed(): void {
        this.update({failed: this.state.failed + 1});
    }

    complete(): void {
        this.update({status: 'completed', finishedAt: new Date().toISOString()});
    }

    fail(error: string): void {
        this.update({status: 'failed', error, finishedAt: new Date().toISOString()});
    }

    onChange(listener: (state: ChargeProgress) => void): void {
        this.emitter.on(CHANGE_EVENT, listener);
    }

    private update(patch: Partial<ChargeProgress>): void {
        this.state = Object.assign(new ChargeProgress(), this.state, patch);
        this.notify();
    }

    private notify(): void {
        try {
            this.emitter.emit(CHANGE_EVENT, this.getState());
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao notificar progresso da cobrança: ' + message);
        }
    }
}
