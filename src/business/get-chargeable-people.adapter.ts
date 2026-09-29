import {Injectable} from '@nestjs/common';
import {GetChargeablePeoplePort} from '../core/business/get-chargeable-people.port.js';
import {Context} from '../core/context.js';
import {ChargeablePerson} from '../domain/chargeable-person.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {loadBillingConfig} from './utils/billing-config.js';
import {calculateBilling} from '../domain/calculations/billing.calculator.js';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

@Injectable()
export class GetChargeablePeopleAdapter implements GetChargeablePeoplePort {
    constructor(
        private readonly studentRepositoryPort: StudentRepositoryPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
    ) {}

    async execute(_context: Context): Promise<ChargeablePerson[]> {
        const {monthlyFee, billingStartDate} = await loadBillingConfig(this.systemConfigRepositoryPort, 'disparar a cobrança');
        const today = new Date();
        const mesAtual = MESES[today.getUTCMonth()];

        const [students, paidByStudent] = await Promise.all([
            this.studentRepositoryPort.findAllActive(),
            this.paymentRepositoryPort.sumApprovedGroupedByActiveStudent(),
        ]);

        const people: ChargeablePerson[] = [];

        for (const student of students) {
            const paidAmount = paidByStudent.get(student.id) ?? 0;

            const billing = calculateBilling({
                monthlyFee,
                billingStartDate,
                referenceDate: today,
                paidAmount,
            });

            if (billing.mesesDevidos === 0) {
                continue;
            }

            const mesAtualStatus = billing.statusMesAMes[billing.statusMesAMes.length - 1];

            const person = new ChargeablePerson();
            person.nome = student.name;
            person.telefone = student.phone;
            person.mesAtual = mesAtual;
            person.valorAtraso = billing.valorAtraso;
            person.saldo = billing.saldo;
            person.mensalidade = monthlyFee;
            person.statusMesAtual = mesAtualStatus.status;

            people.push(person);
        }

        return people;
    }
}
