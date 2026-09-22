import {StudentResponse} from './student.response.js';

export class StudentSummaryResponse {
    student: StudentResponse;
    mesesDevidos: number;
    valorEsperadoAcumulado: number;
    valorPagoAcumulado: number;
    saldo: number;
    valorAtraso: number;
    status: 'EM_DIA' | 'ATRASADO' | 'ADIANTADO';

    constructor(partial: Partial<StudentSummaryResponse>) {
        Object.assign(this, partial);
    }
}
