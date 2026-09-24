import {Module} from '@nestjs/common';
import {CreateUserAdapter} from '../create-user.adapter.js';
import {PersistenceModule} from '../../persistence/configuration/persistence.module.js';
import {SecurityModule} from '../../security/configuration/security.module.js';
import {CreateUserPort} from "../../core/business/create-user.port.js";
import {ExecuteChargePort} from "../../core/business/execute-charge.port.js";
import {ExecuteChargeAdapter} from "../execute-charge.adapter.js";
import {SendWhatsAppMessageAdapter} from "../send-whatsapp-message.adapter.js";
import {SendWhatsAppMessagePort} from "../../core/business/send-whatsapp-message.port.js";
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
import {RegisterPaymentPort} from "../../core/business/register-payment.port.js";
import {RegisterPaymentAdapter} from "../register-payment.adapter.js";
import {RemovePaymentPort} from "../../core/business/remove-payment.port.js";
import {RemovePaymentAdapter} from "../remove-payment.adapter.js";
import {GetDashboardSummaryPort} from "../../core/business/get-dashboard-summary.port.js";
import {GetDashboardSummaryAdapter} from "../get-dashboard-summary.adapter.js";
import {GetChargeablePeoplePort} from "../../core/business/get-chargeable-people.port.js";
import {GetChargeablePeopleAdapter} from "../get-chargeable-people.adapter.js";
import {InfrastructureModule} from "../../infrastructure/configuration/insfrastructure.module.js";
import {RegisterPublicPaymentPort} from "../../core/business/register-public-payment.port.js";
import {RegisterPublicPaymentAdapter} from "../register-public-payment.adapter.js";
import {ApprovePaymentPort} from "../../core/business/approve-payment.port.js";
import {ApprovePaymentAdapter} from "../approve-payment.adapter.js";
import {RejectPaymentPort} from "../../core/business/reject-payment.port.js";
import {RejectPaymentAdapter} from "../reject-payment.adapter.js";
import {ListPendingPaymentsPort} from "../../core/business/list-pending-payments.port.js";
import {ListPendingPaymentsAdapter} from "../list-pending-payments.adapter.js";
import {GetPixInfoPort} from "../../core/business/get-pix-info.port.js";
import {GetPixInfoAdapter} from "../get-pix-info.adapter.js";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PersistenceModule,
        SecurityModule,
        MessagingModule,
        InfrastructureModule,
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
        { provide: RegisterPaymentPort, useClass: RegisterPaymentAdapter },
        { provide: RemovePaymentPort, useClass: RemovePaymentAdapter },
        { provide: GetDashboardSummaryPort, useClass: GetDashboardSummaryAdapter },
        { provide: GetChargeablePeoplePort, useClass: GetChargeablePeopleAdapter },
        { provide: RegisterPublicPaymentPort, useClass: RegisterPublicPaymentAdapter },
        { provide: ApprovePaymentPort, useClass: ApprovePaymentAdapter },
        { provide: RejectPaymentPort, useClass: RejectPaymentAdapter },
        { provide: ListPendingPaymentsPort, useClass: ListPendingPaymentsAdapter },
        { provide: GetPixInfoPort, useClass: GetPixInfoAdapter },
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
        RegisterPaymentPort,
        RemovePaymentPort,
        GetDashboardSummaryPort,
        GetChargeablePeoplePort,
        RegisterPublicPaymentPort,
        ApprovePaymentPort,
        RejectPaymentPort,
        ListPendingPaymentsPort,
        GetPixInfoPort,
    ],
})
export class BusinessModule {}