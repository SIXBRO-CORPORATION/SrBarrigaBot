export const CHARGE_VARIABLES = ['nome', 'mes', 'valor_atraso', 'saldo', 'mensalidade'] as const;

export type ChargeVariable = (typeof CHARGE_VARIABLES)[number];

const VARIABLE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

export function renderChargeMessage(template: string, vars: Record<ChargeVariable, string>): string {
    return template.replace(VARIABLE_PATTERN, (_, name: string) => vars[name as ChargeVariable] ?? '');
}

export function formatBRL(value: number): string {
    return (value || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

export function chargeCron(day: string, time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    return `${minute} ${hour} ${Number(day)} * *`;
}

function validateTemplate(template: string): string | null {
    const available = CHARGE_VARIABLES.map((v) => `{{${v}}}`).join(', ');
    const unknown = [...template.matchAll(VARIABLE_PATTERN)]
        .map((m) => m[1])
        .filter((name) => !CHARGE_VARIABLES.includes(name as ChargeVariable));

    if (unknown.length > 0) {
        return `Variável desconhecida: ${unknown.map((v) => `{{${v}}}`).join(', ')}. Disponíveis: ${available}.`;
    }

    if (/[{}]/.test(template.replace(VARIABLE_PATTERN, ''))) {
        return `Chaves soltas no texto. Use as variáveis no formato {{nome}}. Disponíveis: ${available}.`;
    }

    return null;
}

export function validateChargeSetting(key: string, value: string): string | null {
    switch (key) {
        case 'charge_day':
            return /^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 28
                ? null
                : 'O dia da cobrança deve ser um número de 1 a 28.';
        case 'charge_time':
            return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
                ? null
                : 'O horário da cobrança deve estar no formato HH:mm (ex: 08:40).';
        case 'charge_message_ok':
        case 'charge_message_pending':
            return validateTemplate(value);
        default:
            return null;
    }
}
