import {Student} from './student.js';
import {BillingStatus} from './calculations/billing.calculator.js';

export class StudentSummary {
    student: Student;
    mesesDevidos: number;
    valorEsperadoAcumulado: number;
    valorPagoAcumulado: number;
    saldo: number;
    valorAtraso: number;
    status: BillingStatus;
}
