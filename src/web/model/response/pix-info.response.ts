export class PixInfoResponse {
    pixKey: string;
    receiverName: string;
    receiverCity: string;
    // String "Pix copia e cola" (BR Code) — o front usa pra gerar o QR Code
    // client-side (ex.: lib qrcode.react) e pro botão "copiar código".
    payload: string;

    constructor(partial: Partial<PixInfoResponse>) {
        Object.assign(this, partial);
    }
}
