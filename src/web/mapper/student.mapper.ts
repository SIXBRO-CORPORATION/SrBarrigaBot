import {Injectable} from '@nestjs/common';
import {Student} from '../../domain/student.js';
import {StudentSummary} from "../../domain/student-summary.js";
import {StudentSummaryResponse} from "../model/response/student-summary.response.js";
import {StudentDetail} from "../../domain/student-detail.js";
import {StudentDetailResponse} from "../model/response/student-detail.response.js";
import {StudentMonthStatusResponse} from "../model/response/student-month-status.response.js";
import {StudentResponse} from "../model/response/student.response.js";
import {PaymentMapper} from "./payment.mapper.js";

@Injectable()
export class StudentMapper {
    constructor(private readonly paymentMapper: PaymentMapper) {}

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

    public async toDetailResponse(detail: StudentDetail): Promise<StudentDetailResponse> {
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
            payments: await Promise.all(detail.payments.map((p) => this.paymentMapper.toResponse(p))),
        });
    }
}
