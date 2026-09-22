import {StudentResponse} from './student.response.js';
import {StudentMonthStatusResponse} from './student-month-status.response.js';
import {PaymentResponse} from './payment.response.js';

export class StudentDetailResponse {
    student: StudentResponse;
    mesesDevidos: number;
    valorEsperadoAcumulado: number;
    valorPagoAcumulado: number;
    saldo: number;
    valorAtraso: number;
    status: 'EM_DIA' | 'ATRASADO' | 'ADIANTADO';
    statusMesAMes: StudentMonthStatusResponse[];
    payments: PaymentResponse[];

    constructor(partial: Partial<StudentDetailResponse>) {
        Object.assign(this, partial);
    }
}
