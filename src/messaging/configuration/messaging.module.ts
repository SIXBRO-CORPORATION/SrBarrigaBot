import {Module} from '@nestjs/common';
import {WhatsAppService} from '../services/whatsapp.service.js';
import {WhatsAppConnectionAdapter} from '../adapters/whatsapp-connection.adapter.js';
import {WhatsAppSenderAdapter} from '../adapters/whatsapp-sender.adapter.js';
import {WhatsAppGateway} from '../gateway/whatsapp.gateway.js';
import {WhatsAppConnectionPort} from '../../core/messaging/whatsapp-connection.port.js';
import {WhatsAppSenderPort} from '../../core/messaging/whatsapp-sender.port.js';
import {SecurityModule} from '../../security/configuration/security.module.js';
import {ChargeProgressAdapter} from '../adapters/charge-progress.adapter.js';
import {ChargeProgressPort} from '../../core/messaging/charge-progress.port.js';


@Module({
    imports: [SecurityModule],
    providers: [
        WhatsAppService,
        WhatsAppGateway,
        { provide: WhatsAppConnectionPort, useClass: WhatsAppConnectionAdapter },
        { provide: WhatsAppSenderPort, useClass: WhatsAppSenderAdapter },
        { provide: ChargeProgressPort, useClass: ChargeProgressAdapter },
    ],
    exports: [
        WhatsAppConnectionPort,
        WhatsAppSenderPort,
        ChargeProgressPort,
        WhatsAppService,
    ],
})
export class MessagingModule {}