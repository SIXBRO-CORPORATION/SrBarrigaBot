export class StudentMonthStatusResponse {
    numero: number;
    referencia: string;
    status: 'OK' | 'PENDENTE';

    constructor(partial: Partial<StudentMonthStatusResponse>) {
        Object.assign(this, partial);
    }
}
