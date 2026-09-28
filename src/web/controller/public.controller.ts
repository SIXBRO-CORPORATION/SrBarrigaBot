import {Body, Controller, Get, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {Throttle} from '@nestjs/throttler';
import {RegisterPublicPaymentPort} from '../../core/business/register-public-payment.port.js';
import {GetPixInfoPort} from '../../core/business/get-pix-info.port.js';
import {Context} from '../../core/context.js';
import {ApiResponse} from '../commons/api.response.js';
import {PublicPaymentRequest} from '../model/request/public-payment.request.js';
import {PaymentResponse} from '../model/response/payment.response.js';
import {PixInfoResponse} from '../model/response/pix-info.response.js';
import {PaymentMapper} from '../mapper/payment.mapper.js';
import {receiptFileInterceptor, toUploadFileInput} from '../commons/receipt-file.interceptor.js';


@Controller('public')
export class PublicController {
    constructor(
        private readonly registerPublicPaymentPort: RegisterPublicPaymentPort,
        private readonly getPixInfoPort: GetPixInfoPort,
        private readonly paymentMapper: PaymentMapper,
    ) {}

    @Get('pix')
    @HttpCode(HttpStatus.OK)
    async pixInfo(): Promise<ApiResponse<PixInfoResponse>> {
        const pixInfo = await this.getPixInfoPort.execute(new Context());

        return ApiResponse.success(
            new PixInfoResponse({
                pixKey: pixInfo.pixKey,
                receiverName: pixInfo.receiverName,
                receiverCity: pixInfo.receiverCity,
                payload: pixInfo.payload,
            }),
        );
    }

    @Post('payments')
    @HttpCode(HttpStatus.CREATED)
    @Throttle({default: {limit: 10, ttl: 60_000}})
    @UseInterceptors(receiptFileInterceptor)
    async register(
        @Body() request: PublicPaymentRequest,
        @UploadedFile() comprovante?: Express.Multer.File,
    ): Promise<ApiResponse<PaymentResponse>> {
        const context = new Context();
        context.putProperty('matricula', request.matricula);
        context.putProperty('amount', request.amount);
        context.putProperty('paidAt', request.paidAt ?? null);
        context.putProperty('note', request.note ?? null);

        if (comprovante) {
            context.putProperty('file', toUploadFileInput(comprovante));
        }

        const saved = await this.registerPublicPaymentPort.execute(context);

        return ApiResponse.success(
            await this.paymentMapper.toResponse(saved),
            'Pagamento registrado! Assim que conferirmos o comprovante, ele será aprovado.',
        );
    }
}
