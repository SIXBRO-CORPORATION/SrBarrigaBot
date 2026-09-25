import {Module} from '@nestjs/common';
import {UserController} from '../controller/user.controller.js';
import {BusinessModule} from '../../business/configuration/business.module.js';
import {SecurityModule} from '../../security/configuration/security.module.js';
import {PersistenceModule} from '../../persistence/configuration/persistence.module.js';
import {WhatsAppController} from "../controller/whatsapp.controller.js";
import {MessagingModule} from "../../messaging/configuration/messaging.module.js";
import {StudentController} from "../controller/student.controller.js";
import {ConfigController} from "../controller/config.controller.js";
import {PaymentController} from "../controller/payment.controller.js";
import {DashboardController} from "../controller/dashboard.controller.js";
import {PublicController} from "../controller/public.controller.js";
import {StudentMapper} from "../mapper/student.mapper.js";
import {PaymentMapper} from "../mapper/payment.mapper.js";
import {InfrastructureModule} from "../../infrastructure/configuration/insfrastructure.module.js";
import {UserMapper} from "../mapper/user.mapper.js";

@Module({
    imports: [BusinessModule, SecurityModule, PersistenceModule, MessagingModule, InfrastructureModule],
    controllers: [UserController, WhatsAppController, StudentController, ConfigController, PaymentController, DashboardController, PublicController],
    providers: [StudentMapper, PaymentMapper, UserMapper],
})
export class WebModule {}