import {Injectable} from '@nestjs/common';
import {ExecuteChargePort} from '../core/business/execute-charge.port.js';
import {Context} from '../core/context.js';
import {GetChargeablePeoplePort} from '../core/business/get-chargeable-people.port.js';
import {SendWhatsAppMessagePort} from '../core/business/send-whatsapp-message.port.js';
import {ChargeablePerson} from '../domain/chargeable-person.js';

@Injectable()
export class ExecuteChargeAdapter implements ExecuteChargePort {
    constructor(
        private readonly getChargeablePeoplePort: GetChargeablePeoplePort,
        private readonly sendWhatsAppMessagePort: SendWhatsAppMessagePort,
    ) {}

    async execute(context: Context): Promise<void> {
        console.log('Buscando alunos a cobrar...');

        const contextPessoas = new Context();
        const pessoas = await this.getChargeablePeoplePort.execute(contextPessoas);

        if (pessoas.length === 0) {
            console.warn('Nenhum aluno a cobrar no momento');
            return;
        }

        console.log(`Enviando lembretes para ${pessoas.length} alunos...`);

        for (const pessoa of pessoas) {
            try {
                const mensagem = this.criarMensagem(pessoa);

                const contextMessage = new Context();
                contextMessage.putProperty('number', pessoa.telefone);
                contextMessage.putProperty('message', mensagem);

                await this.sendWhatsAppMessagePort.execute(contextMessage);

                await this.sleep(5000);

            } catch (error) {
                const message = error instanceof Error ? error.message : 'Erro desconhecido';
                console.error(`Erro ao enviar mensagem para ${pessoa.nome}: ` + message);
            }
        }

        console.log('Cobrança concluída!');
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
