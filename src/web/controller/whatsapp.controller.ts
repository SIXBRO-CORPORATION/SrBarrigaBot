import {ConflictException, Controller, Get, Post, HttpCode, HttpStatus, Sse, UseGuards} from '@nestjs/common';
import {WhatsAppConnectionPort} from '../../core/messaging/whatsapp-connection.port.js';
import {ExecuteChargePort} from '../../core/business/execute-charge.port.js';
import {Context} from '../../core/context.js';
import {ApiResponse} from '../commons/api.response.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';
import {WhatsAppService} from '../../messaging/services/whatsapp.service.js';
import {ChargeProgressPort} from '../../core/messaging/charge-progress.port.js';
import {ChargeProgress} from '../../domain/charge-progress.js';
import {BusinessException} from '../../domain/exceptions/business.exception.js';

interface WhatsAppStatusResponse {
    isConnected: boolean;
    needsQR: boolean;
}

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
    constructor(
        private readonly whatsappConnectionPort: WhatsAppConnectionPort,
        private readonly executeChargePort: ExecuteChargePort,
        private readonly whatsappService: WhatsAppService,
        private readonly chargeProgressPort: ChargeProgressPort,
    ) {}

    @Get('status')
    @HttpCode(HttpStatus.OK)
    async getStatus(): Promise<ApiResponse<WhatsAppStatusResponse>> {
        const status = await this.whatsappConnectionPort.getStatus();

        const response: WhatsAppStatusResponse = {
            isConnected: status.isConnected,
            needsQR: status.needsQR,
        };

        return ApiResponse.success(response);
    }

    @Post('connect')
    @HttpCode(HttpStatus.OK)
    async connect(): Promise<ApiResponse<string>> {
        await this.whatsappConnectionPort.connect();
        return ApiResponse.successMessage('Conexão iniciada. Aguarde o QR code.');
    }

    @Post('disconnect')
    @HttpCode(HttpStatus.OK)
    async disconnect(): Promise<ApiResponse<string>> {
        await this.whatsappConnectionPort.disconnect();
        return ApiResponse.successMessage('WhatsApp desconectado com sucesso');
    }

    @Post('execute-charge')
    @HttpCode(HttpStatus.ACCEPTED)
    async executeCharge(): Promise<ApiResponse<ChargeProgress>> {
        if (!this.whatsappConnectionPort.isConnected()) {
            throw new BusinessException('WhatsApp não está conectado');
        }

        if (this.chargeProgressPort.isRunning()) {
            throw new ConflictException('Já existe uma cobrança em andamento');
        }

        this.executeChargePort.execute(new Context()).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro ao executar cobrança manual: ' + message);
        });

        return ApiResponse.success(
            this.chargeProgressPort.getState(),
            'Cobrança iniciada em segundo plano',
        );
    }
}
