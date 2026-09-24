export interface PixPayloadInput {
    pixKey: string;
    receiverName: string;
    receiverCity: string;
}

function tlv(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
}

function toAsciiUpper(value: string, maxLength: number): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x00-\x7F]/g, '')
        .toUpperCase()
        .trim()
        .slice(0, maxLength);
}

function crc16ccitt(payload: string): string {
    let crc = 0xffff;
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;

        for (let bit = 0; bit < 8; bit++) {
            crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ polynomial) : (crc << 1);
            crc &= 0xffff;
        }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayload(input: PixPayloadInput): string {
    const merchantAccountInfo = tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', input.pixKey.trim()));
    const additionalDataField = tlv('62', tlv('05', '***'));

    const payloadWithoutCrc =
        tlv('00', '01') +
        merchantAccountInfo +
        tlv('52', '0000') +
        tlv('53', '986') + // BRL
        tlv('58', 'BR') +
        tlv('59', toAsciiUpper(input.receiverName, 25)) +
        tlv('60', toAsciiUpper(input.receiverCity, 15)) +
        additionalDataField +
        '6304';

    return payloadWithoutCrc + crc16ccitt(payloadWithoutCrc);
}
