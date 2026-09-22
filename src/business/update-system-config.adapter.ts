import {Injectable} from '@nestjs/common';
import {UpdateSystemConfigPort} from '../core/business/update-system-config.port.js';
import {Context} from '../core/context.js';
import {SystemConfig} from '../domain/system-config.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';

@Injectable()
export class UpdateSystemConfigAdapter implements UpdateSystemConfigPort {
    constructor(private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort) {}

    async execute(context: Context): Promise<SystemConfig> {
        const config = context.getData(SystemConfig);

        if (!config || !config.key || config.key.trim() === '') {
            throw new BusinessException('Por favor, informe a chave de configuração.');
        }

        if (config.value === undefined || config.value === null || config.value.trim() === '') {
            throw new BusinessException('Por favor, informe o valor da configuração.');
        }

        return await this.systemConfigRepositoryPort.set(config.key.trim(), config.value.trim());
    }
}
