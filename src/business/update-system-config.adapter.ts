import {Injectable} from '@nestjs/common';
import {UpdateSystemConfigPort} from '../core/business/update-system-config.port.js';
import {Context} from '../core/context.js';
import {SystemConfig} from '../domain/system-config.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {validateChargeSetting} from '../domain/calculations/charge-settings.js';
import {ChargeScheduler} from '../messaging/scheduler/charge.scheduler.js';

@Injectable()
export class UpdateSystemConfigAdapter implements UpdateSystemConfigPort {
    constructor(
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
        private readonly chargeScheduler: ChargeScheduler,
    ) {}

    async execute(context: Context): Promise<SystemConfig> {
        const config = context.getData(SystemConfig);

        if (!config || !config.key || config.key.trim() === '') {
            throw new BusinessException('Por favor, informe a chave de configuração.');
        }

        if (config.value === undefined || config.value === null || config.value.trim() === '') {
            throw new BusinessException('Por favor, informe o valor da configuração.');
        }

        const key = config.key.trim();
        const existing = await this.systemConfigRepositoryPort.get(key);

        if (!existing) {
            throw new BusinessException('Chave de configuração inválida. Não é possível cadastrar novas configurações por aqui.');
        }

        const value = config.value.trim();

        const invalid = validateChargeSetting(key, value);
        if (invalid) {
            throw new BusinessException(invalid);
        }

        const saved = await this.systemConfigRepositoryPort.set(key, value);

        if (key === 'charge_day' || key === 'charge_time') {
            await this.chargeScheduler.reschedule();
        }

        return saved;
    }
}
