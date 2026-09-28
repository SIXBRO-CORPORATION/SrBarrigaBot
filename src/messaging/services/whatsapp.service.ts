import {Injectable, OnModuleDestroy} from '@nestjs/common';
import makeWASocket, {DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion} from '@whiskeysockets/baileys';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import {EventEmitter} from 'events';
import { rmSync, existsSync } from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Injectable()
export class WhatsAppService extends EventEmitter implements OnModuleDestroy {
    private sock: any = null;
    private _isConnected: boolean = false;
    private _needsQR: boolean = false;
    private _currentQR: string | undefined = undefined;

    constructor() {
        super();
    }

    async connect(): Promise<boolean> {
        try {
            if (this.sock) {
                try {
                    this.sock.ev.removeAllListeners();
                    this.sock = null;
                } catch (error) {
                    console.warn('Erro ao limpar socket anterior:', error);
                }
            }

            this._isConnected = false;
            this._needsQR = false;
            this._currentQR = undefined;

            const authFolder = join(__dirname, '../../../auth_info');
            const {state, saveCreds} = await useMultiFileAuthState(authFolder);
            const {version} = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
            });

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('connection.update', (update: any) => {
                const {connection, lastDisconnect, qr} = update;

                if (qr) {
                    this._needsQR = true;
                    this._currentQR = qr;
                    this.emit('qr', qr);
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;

                    if (shouldReconnect) {
                        this._isConnected = false;
                        this._needsQR = true;
                        this.emit('disconnected');
                        setTimeout(() => this.connect(), 3000);
                    } else {
                        this._isConnected = false;
                        this._needsQR = true;
                        this._currentQR = undefined;
                        this.emit('logged-out');
                    }
                } else if (connection === 'open') {
                    this._isConnected = true;
                    this._needsQR = false;
                    this._currentQR = undefined;
                    this.emit('connected');
                }
            });

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao conectar no WhatsApp: ' + message);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.sock) {
            try {
                await this.sock.logout();
            } catch (error) {
                console.warn('Erro ao desconectar:', error);
            } finally {
                this.sock.ev.removeAllListeners();
                this.sock = null;
                this._isConnected = false;
                this._needsQR = true;
                this._currentQR = undefined;
                this.clearAuthFiles();
                this.emit('logged-out')
            }
        }
    }

    formatPhoneNumber(number: string): string {
        let cleaned = number.replace(/\D/g, '');

        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        if (!cleaned.startsWith('55')) {
            cleaned = '55' + cleaned;
        }

        return cleaned + '@s.whatsapp.net';
    }

    async sendMessage(number: string, message: string): Promise<boolean> {
        try {
            if (!this._isConnected || !this.sock) {
                throw new Error('WhatsApp não está conectado');
            }

            const formattedNumber = this.formatPhoneNumber(number);
            await this.sock.sendMessage(formattedNumber, {text: message});

            return true;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error(`Erro ao enviar mensagem para ${number}: ${errorMsg}`);
            throw error;
        }
    }

    isConnected(): boolean {
        return this._isConnected;
    }

    needsQR(): boolean {
        return this._needsQR;
    }

    getCurrentQR(): string | undefined {
        return this._currentQR;
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    private clearAuthFiles(): void {
        const authFolder = join(__dirname, '../../../auth_info');
        if (existsSync(authFolder)) {
            rmSync(authFolder, { recursive: true, force: true });
            console.log('Arquivos de sessão removidos');
        }
    }
}