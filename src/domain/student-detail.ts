import {Student} from './student.js';
import {Payment} from './payment.js';
import {BillingStatus, StudentMonthStatus} from './calculations/billing.calculator.js';

export class StudentDetail {
    student: Student;
    mesesDevidos: number;
    valorEsperadoAcumulado: number;
    valorPagoAcumulado: number;
    saldo: number;
    valorAtraso: number;
    status: BillingStatus;
    statusMesAMes: StudentMonthStatus[];
    payments: Payment[];
}
