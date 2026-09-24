import {ChargeProgress} from "../../domain/charge-progress.js";

export abstract class ChargeProgressPort {
    abstract getState(): ChargeProgress;
    abstract isRunning(): boolean;
    abstract start(): boolean;
    abstract setTotal(total: number): void;
    abstract reportSent(): void;
    abstract reportFailed(): void;
    abstract complete(): void;
    abstract fail(error: string): void;
    abstract onChange(listener: (state: ChargeProgress) => void): void;
}
