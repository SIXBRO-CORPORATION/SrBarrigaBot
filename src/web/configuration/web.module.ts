import {Module} from '@nestjs/common';
import {UserController} from '../controller/user.controller.js';
import {BusinessModule} from '../../business/configuration/business.module.js';
import {SecurityModule} from '../../security/configuration/security.module.js';
import {PersistenceModule} from '../../persistence/configuration/persistence.module.js';
import {WhatsAppController} from "../controller/whatsapp.controller.js";
import {MessagingModule} from "../../messaging/configuration/messaging.module.js";
import {StudentController} from "../controller/student.controller.js";
import {ConfigController} from "../controller/config.controller.js";

@Module({
    imports: [BusinessModule, SecurityModule, PersistenceModule, MessagingModule],
    controllers: [UserController, WhatsAppController, StudentController, ConfigController],
})
export class WebModule {}