import {Module} from '@nestjs/common';
import {PrismaConfiguration} from './prisma.configuration.js';
import {UserMapper} from '../mapper/user.mapper.js';
import {UserRepositoryAdapter} from '../adapter/user.repository.adapter.js';
import {UserRepositoryPort} from "../../core/persistence/user.repository.port.js";
import {StudentMapper} from '../mapper/student.mapper.js';
import {StudentRepositoryAdapter} from '../adapter/student.repository.adapter.js';
import {StudentRepositoryPort} from '../../core/persistence/student.repository.port.js';
import {PaymentMapper} from '../mapper/payment.mapper.js';
import {PaymentRepositoryAdapter} from '../adapter/payment.repository.adapter.js';
import {PaymentRepositoryPort} from '../../core/persistence/payment.repository.port.js';
import {SystemConfigMapper} from '../mapper/system-config.mapper.js';
import {SystemConfigRepositoryAdapter} from '../adapter/system-config.repository.adapter.js';
import {SystemConfigRepositoryPort} from '../../core/persistence/system-config.repository.port.js';

@Module({
    providers: [
        PrismaConfiguration,
        UserMapper,
        {
            provide: UserRepositoryPort,
            useClass: UserRepositoryAdapter,
        },
        StudentMapper,
        {
            provide: StudentRepositoryPort,
            useClass: StudentRepositoryAdapter,
        },
        PaymentMapper,
        {
            provide: PaymentRepositoryPort,
            useClass: PaymentRepositoryAdapter,
        },
        SystemConfigMapper,
        {
            provide: SystemConfigRepositoryPort,
            useClass: SystemConfigRepositoryAdapter,
        },
    ],
    exports: [
        UserRepositoryPort,
        StudentRepositoryPort,
        PaymentRepositoryPort,
        SystemConfigRepositoryPort,
        PrismaConfiguration,
    ],
})
export class PersistenceModule {}