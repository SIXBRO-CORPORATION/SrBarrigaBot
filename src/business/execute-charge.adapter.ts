import {Injectable} from '@nestjs/common';
import {ExecuteChargePort} from '../core/business/execute-charge.port.js';
import {Context} from '../core/context.js';
import {GetChargeablePeoplePort} from '../core/business/get-chargeable-people.port.js';
import {SendWhatsAppMessagePort} from '../core/business/send-whatsapp-message.port.js';
import {ChargeablePerson} from '../domain/chargeable-person.js';
import {ChargeProgressPort} from '../core/messaging/charge-progress.port.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {SystemConfigRepositoryPort} from '../core/persistence/system-config.repository.port.js';
import {formatBRL, renderChargeMessage} from '../domain/calculations/charge-settings.js';

interface ChargeTemplates {
    ok: string;
    pending: string;
}

@Injectable()
export class ExecuteChargeAdapter implements ExecuteChargePort {
    constructor(
        private readonly getChargeablePeoplePort: GetChargeablePeoplePort,
        private readonly sendWhatsAppMessagePort: SendWhatsAppMessagePort,
        private readonly chargeProgressPort: ChargeProgressPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
    ) {}

    async execute(context: Context): Promise<void> {

        if (!this.chargeProgressPort.start()) {
            throw new BusinessException('Já existe uma cobrança em andamento');
        }

        try {
            const templates = await this.loadTemplates();

            console.log('Buscando alunos a cobrar...');

            const contextPessoas = new Context();
            const pessoas = await this.getChargeablePeoplePort.execute(contextPessoas);

            this.chargeProgressPort.setTotal(pessoas.length);

            if (pessoas.length === 0) {
                console.warn('Nenhum aluno a cobrar no momento');
                this.chargeProgressPort.complete();
                return;
            }

            console.log(`Enviando lembretes para ${pessoas.length} alunos...`);

            for (let i = 0; i < pessoas.length; i++) {
                const pessoa = pessoas[i];

                try {
                    const mensagem = this.criarMensagem(pessoa, templates);

                    const contextMessage = new Context();
                    contextMessage.putProperty('number', pessoa.telefone);
                    contextMessage.putProperty('message', mensagem);

                    await this.sendWhatsAppMessagePort.execute(contextMessage);
                    this.chargeProgressPort.reportSent();

                    if (i < pessoas.length - 1) {
                        await this.sleep(5000);
                    }

                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Erro desconhecido';
                    console.error(`Erro ao enviar mensagem para ${pessoa.nome}: ` + message);
                    this.chargeProgressPort.reportFailed();
                }
            }

            console.log('Cobrança concluída!');
            this.chargeProgressPort.complete();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            this.chargeProgressPort.fail(message);
            throw error;
        }
    }

    private async loadTemplates(): Promise<ChargeTemplates> {
        const configs = await this.systemConfigRepositoryPort.findByKeys(['charge_message_ok', 'charge_message_pending']);
        const ok = configs.get('charge_message_ok')?.value;
        const pending = configs.get('charge_message_pending')?.value;

        if (!ok || !pending) {
            throw new BusinessException('Configure os textos da mensagem de cobrança em /config antes de disparar a cobrança.');
        }

        return {ok, pending};
    }

    private criarMensagem(pessoa: ChargeablePerson, templates: ChargeTemplates): string {
        return renderChargeMessage(pessoa.statusMesAtual === 'OK' ? templates.ok : templates.pending, {
            nome: pessoa.nome,
            mes: pessoa.mesAtual,
            valor_atraso: formatBRL(pessoa.valorAtraso),
            mensalidade: formatBRL(pessoa.mensalidade),
        });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
