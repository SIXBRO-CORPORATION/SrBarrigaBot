import {Injectable} from '@nestjs/common';
import {GetPixInfoPort} from '../core/business/get-pix-info.port.js';
import {Context} from '../core/context.js';
import {PixInfo} from '../domain/pix-info.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {buildPixPayload} from '../domain/calculations/pix-payload.calculator.js';

@Injectable()
export class GetPixInfoAdapter implements GetPixInfoPort {
    constructor(private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort) {}

    async execute(_context: Context): Promise<PixInfo> {
        const pixKeyConfig = await this.systemConfigRepositoryPort.get('pix_key');
        const receiverNameConfig = await this.systemConfigRepositoryPort.get('pix_receiver_name');
        const receiverCityConfig = await this.systemConfigRepositoryPort.get('pix_receiver_city');

        if (!pixKeyConfig?.value || !receiverNameConfig?.value || !receiverCityConfig?.value) {
            throw new BusinessException(
                'Chave Pix ainda não configurada. Peça para um admin cadastrar em /config (pix_key, pix_receiver_name, pix_receiver_city).',
            );
        }

        const pixInfo = new PixInfo();
        pixInfo.pixKey = pixKeyConfig.value;
        pixInfo.receiverName = receiverNameConfig.value;
        pixInfo.receiverCity = receiverCityConfig.value;
        pixInfo.payload = buildPixPayload({
            pixKey: pixKeyConfig.value,
            receiverName: receiverNameConfig.value,
            receiverCity: receiverCityConfig.value,
        });

        return pixInfo;
    }
}
