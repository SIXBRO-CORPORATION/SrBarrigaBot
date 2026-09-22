import {Injectable} from '@nestjs/common';
import {GetChargeablePeoplePort} from '../core/business/get-chargeable-people.port.js';
import {Context} from '../core/context.js';
import {ChargeablePerson} from '../domain/chargeable-person.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';
import {PaymentRepositoryPort} from '../core/persistence/payment.repository.port.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
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
        const monthlyFeeConfig = await this.systemConfigRepositoryPort.get('monthly_fee');
        const billingStartDateConfig = await this.systemConfigRepositoryPort.get('billing_start_date');

        if (!monthlyFeeConfig || !billingStartDateConfig) {
            throw new BusinessException(
                'Configure a mensalidade e a data de início de cobrança em /config antes de disparar a cobrança.',
            );
        }

        const monthlyFee = Number(monthlyFeeConfig.value);
        const billingStartDate = new Date(billingStartDateConfig.value);
        const today = new Date();
        const mesAtual = MESES[today.getMonth()];

        const students = await this.studentRepositoryPort.findAllActive();

        const people: ChargeablePerson[] = [];

        for (const student of students) {
            if (!student.active) {
                continue;
            }

            const payments = await this.paymentRepositoryPort.findByStudentId(student.id);
            const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

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
            person.statusMesAtual = mesAtualStatus.status;

            people.push(person);
        }

        return people;
    }
}
