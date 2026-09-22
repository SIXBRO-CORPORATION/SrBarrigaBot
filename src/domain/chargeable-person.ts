import {MonthStatus} from './calculations/billing.calculator.js';

export class ChargeablePerson {
    nome: string;
    telefone: string;
    mesAtual: string;
    valorAtraso: number;
    statusMesAtual: MonthStatus;
}
