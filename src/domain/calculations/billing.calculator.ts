
export type MonthStatus = 'OK' | 'PENDENTE';

export type BillingStatus = 'EM_DIA' | 'ATRASADO' | 'ADIANTADO';

export interface StudentMonthStatus {
    numero: number;
    referencia: string;
    status: MonthStatus;
}

export interface BillingCalculationInput {
    monthlyFee: number;
    billingStartDate: Date;
    referenceDate: Date;
    paidAmount: number;
}

export interface BillingCalculationResult {
    mesesDevidos: number;
    valorEsperadoAcumulado: number;
    valorPagoAcumulado: number;
    saldo: number;
    valorAtraso: number;
    status: BillingStatus;
    statusMesAMes: StudentMonthStatus[];
}

function monthsElapsedInclusive(start: Date, end: Date): number {
    if (end < start) {
        return 0;
    }

    const months =
        (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
        (end.getUTCMonth() - start.getUTCMonth()) +
        1;

    return Math.max(months, 0);
}

function monthReference(start: Date, monthNumber: number): string {
    const year = start.getUTCFullYear();
    const month = start.getUTCMonth() + (monthNumber - 1);

    const date = new Date(Date.UTC(year, month, 1));
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');

    return `${yyyy}-${mm}`;
}

export function calculateBilling(input: BillingCalculationInput): BillingCalculationResult {
    const { monthlyFee, billingStartDate, referenceDate, paidAmount } = input;

    const mesesDevidos = monthsElapsedInclusive(billingStartDate, referenceDate);
    const valorEsperadoAcumulado = round2(mesesDevidos * monthlyFee);
    const valorPagoAcumulado = round2(paidAmount);
    const saldo = round2(valorPagoAcumulado - valorEsperadoAcumulado);

    let status: BillingStatus = 'EM_DIA';
    if (saldo < 0) status = 'ATRASADO';
    else if (saldo > 0) status = 'ADIANTADO';

    const valorAtraso = saldo < 0 ? round2(Math.abs(saldo)) : 0;

    const statusMesAMes: StudentMonthStatus[] = [];
    for (let i = 1; i <= mesesDevidos; i++) {
        statusMesAMes.push({
            numero: i,
            referencia: monthReference(billingStartDate, i),
            status: valorPagoAcumulado >= round2(i * monthlyFee) ? 'OK' : 'PENDENTE',
        });
    }

    return {
        mesesDevidos,
        valorEsperadoAcumulado,
        valorPagoAcumulado,
        saldo,
        valorAtraso,
        status,
        statusMesAMes,
    };
}

export interface ClassTotalsStudent {
    active: boolean;
    paidAmount: number;
}

export interface ClassTotalsInput {
    monthlyFee: number;
    billingStartDate: Date;
    referenceDate: Date;
    students: ClassTotalsStudent[];
}

export interface ClassTotalsResult {
    valorEsperadoTotal: number;
    valorContribuidoTotal: number;
}

export function calculateClassTotals(input: ClassTotalsInput): ClassTotalsResult {
    const { monthlyFee, billingStartDate, referenceDate, students } = input;

    let valorEsperadoTotal = 0;
    let valorContribuidoTotal = 0;

    for (const student of students) {
        const paid = round2(student.paidAmount);
        valorContribuidoTotal += paid;

        valorEsperadoTotal += student.active
            ? calculateBilling({ monthlyFee, billingStartDate, referenceDate, paidAmount: paid }).valorEsperadoAcumulado
            : paid;
    }

    return {
        valorEsperadoTotal: round2(valorEsperadoTotal),
        valorContribuidoTotal: round2(valorContribuidoTotal),
    };
}

export function round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
