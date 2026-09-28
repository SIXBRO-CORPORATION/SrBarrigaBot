import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { JwtUtil } from '../../security/utils/jwt.util.js';
import { config } from '../../security/configuration/env.js';
import { ChargeProgressPort } from '../../core/messaging/charge-progress.port.js';

@Injectable()
@SkipThrottle()
@WebSocketGateway({
    cors: {
        origin: config.corsOrigins,
        credentials: true,
    },
    namespace: '/whatsapp',
})
export class WhatsAppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly whatsappService: WhatsAppService,
        private readonly chargeProgressPort: ChargeProgressPort,
        private readonly jwtUtil: JwtUtil,
    ) {}

    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized');

        this.whatsappService.on('qr', (qr: string) => {
            this.server.emit('whatsapp:qr', { qrCode: qr });
        });

        this.whatsappService.on('connected', () => {
            this.server.emit('whatsapp:status', {
                isConnected: true,
                needsQR: false,
            });
        });

        this.whatsappService.on('disconnected', () => {
            this.server.emit('whatsapp:status', {
                isConnected: false,
                needsQR: true,
            });
        });

        this.whatsappService.on('logged-out', () => {
            this.server.emit('whatsapp:status', {
                isConnected: false,
                needsQR: true,
            });
        });

        this.chargeProgressPort.onChange((state) => {
            this.server.emit('whatsapp:charge', state);
        });
    }

    async handleConnection(client: Socket) {
        const authHeader = client.handshake.headers.authorization;
        const token = client.handshake.auth?.token
            ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

        try {
            this.jwtUtil.verify(token, 'access');
        } catch {
            client.disconnect(true);
            return;
        }

        console.log(`Client connected: ${client.id}`);

        const status = {
            isConnected: this.whatsappService.isConnected(),
            needsQR: this.whatsappService.needsQR(),
            qrCode: this.whatsappService.getCurrentQR(),
        };

        client.emit('whatsapp:status', {
            isConnected: status.isConnected,
            needsQR: status.needsQR,
        });

        if (status.qrCode) {
            client.emit('whatsapp:qr', { qrCode: status.qrCode });
        }

        client.emit('whatsapp:charge', this.chargeProgressPort.getState());
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('whatsapp:connect')
    async handleConnect(client: Socket) {
        try {
            await this.whatsappService.connect();
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao conectar';
            return { success: false, error: message };
        }
    }

    @SubscribeMessage('whatsapp:disconnect')
    async handleDisconnect2(client: Socket) {
        try {
            await this.whatsappService.disconnect();
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao desconectar';
            return { success: false, error: message };
        }
    }

    @SubscribeMessage('whatsapp:get-status')
    async handleGetStatus(client: Socket) {
        return {
            isConnected: this.whatsappService.isConnected(),
            needsQR: this.whatsappService.needsQR(),
            qrCode: this.whatsappService.getCurrentQR(),
        };
    }
}