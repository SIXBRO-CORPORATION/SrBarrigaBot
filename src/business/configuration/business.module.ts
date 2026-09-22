import {Module} from '@nestjs/common';
import {CreateUserAdapter} from '../create-user.adapter.js';
import {PersistenceModule} from '../../persistence/configuration/persistence.module.js';
import {SecurityModule} from '../../security/configuration/security.module.js';
import {CreateUserPort} from "../../core/business/create-user.port.js";
import {ExecuteChargePort} from "../../core/business/execute-charge.port.js";
import {ExecuteChargeAdapter} from "../execute-charge.adapter.js";
import {SendWhatsAppMessageAdapter} from "../send-whatsapp-message.adapter.js";
import {SendWhatsAppMessagePort} from "../../core/business/send-whatsapp-message.port.js";
import {InfrastructureModule} from "../../infrastructure/configuration/insfrastructure.module.js";
import {MessagingModule} from "../../messaging/configuration/messaging.module.js";
import {ChargeScheduler} from "../../messaging/scheduler/charge.scheduler.js";
import {ScheduleModule} from "@nestjs/schedule";
import {CreateStudentPort} from "../../core/business/create-student.port.js";
import {CreateStudentAdapter} from "../create-student.adapter.js";
import {UpdateStudentPort} from "../../core/business/update-student.port.js";
import {UpdateStudentAdapter} from "../update-student.adapter.js";
import {RemoveStudentPort} from "../../core/business/remove-student.port.js";
import {RemoveStudentAdapter} from "../remove-student.adapter.js";
import {UpdateSystemConfigPort} from "../../core/business/update-system-config.port.js";
import {UpdateSystemConfigAdapter} from "../update-system-config.adapter.js";
import {ListStudentsPort} from "../../core/business/list-students.port.js";
import {ListStudentsAdapter} from "../list-students.adapter.js";
import {GetStudentDetailPort} from "../../core/business/get-student-detail.port.js";
import {GetStudentDetailAdapter} from "../get-student-detail.adapter.js";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PersistenceModule,
        SecurityModule,
        InfrastructureModule,
        MessagingModule
    ],
    providers: [
        ChargeScheduler,
        { provide: CreateUserPort, useClass: CreateUserAdapter },
        { provide: ExecuteChargePort, useClass: ExecuteChargeAdapter },
        {
            provide: SendWhatsAppMessagePort,
            useClass: SendWhatsAppMessageAdapter
        },
        { provide: CreateStudentPort, useClass: CreateStudentAdapter },
        { provide: UpdateStudentPort, useClass: UpdateStudentAdapter },
        { provide: RemoveStudentPort, useClass: RemoveStudentAdapter },
        { provide: UpdateSystemConfigPort, useClass: UpdateSystemConfigAdapter },
        { provide: ListStudentsPort, useClass: ListStudentsAdapter },
        { provide: GetStudentDetailPort, useClass: GetStudentDetailAdapter },
    ],
    exports: [
        CreateUserPort,
        ExecuteChargePort,
        SendWhatsAppMessagePort,
        CreateStudentPort,
        UpdateStudentPort,
        RemoveStudentPort,
        UpdateSystemConfigPort,
        ListStudentsPort,
        GetStudentDetailPort,
    ],
})
export class BusinessModule {}