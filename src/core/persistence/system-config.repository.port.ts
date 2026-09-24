import {SystemConfig} from '../../domain/system-config.js';

export abstract class SystemConfigRepositoryPort {
    abstract findAll(): Promise<SystemConfig[]>;
    abstract get(key: string): Promise<SystemConfig | null>;
    abstract findByKeys(keys: string[]): Promise<Map<string, SystemConfig>>;
    abstract set(key: string, value: string): Promise<SystemConfig>;
}
