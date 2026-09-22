import {Injectable} from '@nestjs/common';
import {SystemConfig as PrismaSystemConfig} from '../../../generated/prisma/client.js';
import {SystemConfig} from '../../domain/system-config.js';

@Injectable()
export class SystemConfigMapper {
    toDomain(entity: PrismaSystemConfig): SystemConfig {
        const config = new SystemConfig();
        config.id = entity.id;
        config.key = entity.key;
        config.value = entity.value;
        config.modifiedAt = entity.modifiedAt;
        return config;
    }
}
