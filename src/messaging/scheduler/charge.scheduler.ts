import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {CronJob} from 'cron';
import {ExecuteChargePort} from '../../core/business/execute-charge.port.js';
import {SystemConfigRepositoryPort} from '../../core/persistence/system-config.repository.port.js';
import {Context} from '../../core/context.js';
import {chargeCron} from '../../domain/calculations/charge-settings.js';

const JOB_NAME = 'send_messages';

@Injectable()
export class ChargeScheduler implements OnApplicationBootstrap {
    constructor(
        private readonly executeChargePort: ExecuteChargePort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        try {
            await this.reschedule();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao agendar cobrança: ' + message);
        }
    }

    async reschedule(): Promise<void> {
        const configs = await this.systemConfigRepositoryPort.findByKeys(['charge_day', 'charge_time']);
        const day = configs.get('charge_day')?.value;
        const time = configs.get('charge_time')?.value;

        if (!day || !time) {
            console.warn('charge_day/charge_time não configurados; cobrança automática desativada.');
            return;
        }

        const job = new CronJob(chargeCron(day, time), () => void this.executeCharge(), null, false, 'America/Fortaleza');

        if (this.schedulerRegistry.doesExist('cron', JOB_NAME)) {
            this.schedulerRegistry.deleteCronJob(JOB_NAME);
        }
        this.schedulerRegistry.addCronJob(JOB_NAME, job);
        job.start();
    }

    private async executeCharge(): Promise<void> {
        try {
            await this.executeChargePort.execute(new Context());
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao executar cobrança agendada: ' + message);
        }
    }
}
