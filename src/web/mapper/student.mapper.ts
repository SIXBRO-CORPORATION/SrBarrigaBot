import {Injectable} from '@nestjs/common';
import {Student} from '../../domain/student.js';
import {StudentSummary} from "../../domain/student-summary.js";
import {StudentSummaryResponse} from "../model/response/student-summary.response.js";
import {StudentDetail} from "../../domain/student-detail.js";
import {StudentDetailResponse} from "../model/response/student-detail.response.js";
import {StudentMonthStatusResponse} from "../model/response/student-month-status.response.js";
import {PaymentResponse} from "../model/response/payment.response.js";
import {StudentResponse} from "../model/response/student.response.js";

@Injectable()
export class StudentMapper {
    public toResponse(student: Student): StudentResponse {
        return new StudentResponse({
            id: student.id,
            name: student.name,
            matricula: student.matricula,
            phone: student.phone,
            active: student.active,
            inactivatedAt: student.inactivatedAt,
            createdAt: student.createdAt,
        });
    }

    public toSummaryResponse(summary: StudentSummary): StudentSummaryResponse {
        return new StudentSummaryResponse({
            student: this.toResponse(summary.student),
            mesesDevidos: summary.mesesDevidos,
            valorEsperadoAcumulado: summary.valorEsperadoAcumulado,
            valorPagoAcumulado: summary.valorPagoAcumulado,
            saldo: summary.saldo,
            valorAtraso: summary.valorAtraso,
            status: summary.status,
        });
    }

    public toDetailResponse(detail: StudentDetail): StudentDetailResponse {
        return new StudentDetailResponse({
            student: this.toResponse(detail.student),
            mesesDevidos: detail.mesesDevidos,
            valorEsperadoAcumulado: detail.valorEsperadoAcumulado,
            valorPagoAcumulado: detail.valorPagoAcumulado,
            saldo: detail.saldo,
            valorAtraso: detail.valorAtraso,
            status: detail.status,
            statusMesAMes: detail.statusMesAMes.map(
                (m) => new StudentMonthStatusResponse({ numero: m.numero, referencia: m.referencia, status: m.status }),
            ),
            payments: detail.payments.map(
                (p) =>
                    new PaymentResponse({
                        id: p.id,
                        amount: p.amount,
                        paidAt: p.paidAt,
                        note: p.note,
                        receiptUrl: p.receiptUrl,
                        createdAt: p.createdAt,
                    }),
            ),
        });
    }
}
