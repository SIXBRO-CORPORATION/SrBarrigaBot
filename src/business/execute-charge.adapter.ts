import {Injectable} from '@nestjs/common';
import {ExecuteChargePort} from '../core/business/execute-charge.port.js';
import {Context} from '../core/context.js';
import {GetChargeablePeoplePort} from '../core/business/get-chargeable-people.port.js';
import {SendWhatsAppMessagePort} from '../core/business/send-whatsapp-message.port.js';
import {ChargeablePerson} from '../domain/chargeable-person.js';
import {ChargeProgressPort} from '../core/messaging/charge-progress.port.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';

@Injectable()
export class ExecuteChargeAdapter implements ExecuteChargePort {
    constructor(
        private readonly getChargeablePeoplePort: GetChargeablePeoplePort,
        private readonly sendWhatsAppMessagePort: SendWhatsAppMessagePort,
        private readonly chargeProgressPort: ChargeProgressPort,
    ) {}

    async execute(context: Context): Promise<void> {

        if (!this.chargeProgressPort.start()) {
            throw new BusinessException('Já existe uma cobrança em andamento');
        }

        try {
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
                    const mensagem = this.criarMensagem(pessoa);

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

    private criarMensagem(pessoa: ChargeablePerson): string {
        if (pessoa.statusMesAtual === 'OK') {
            return `Olá ${pessoa.nome}! 👋

Este é um lembrete automático sobre o pagamento referente ao mês de *${pessoa.mesAtual}*.

Você está em dia com as mensalidades até agora, valeu! 🙌

Qualquer dúvida, estou à disposição! 😊`;
        }

        const avisoAtraso = pessoa.valorAtraso > 0
            ? `\n\nSeu saldo em atraso atual é de *R$ ${pessoa.valorAtraso.toFixed(2)}*.`
            : '';

        return `Olá ${pessoa.nome}! 👋

Este é um lembrete automático sobre o pagamento referente ao mês de *${pessoa.mesAtual}*.

Por favor, realize o pagamento até o dia 10 deste mês.${avisoAtraso}

Caso já tenha pago, desconsidere esta mensagem.

Qualquer dúvida, estou à disposição! 😊`;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
