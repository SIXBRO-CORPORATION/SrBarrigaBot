import {BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {RegisterPublicPaymentPort} from '../../core/business/register-public-payment.port.js';
import {GetPixInfoPort} from '../../core/business/get-pix-info.port.js';
import {Context} from '../../core/context.js';
import {UploadFileInput} from '../../domain/upload-file-input.js';
import {ALLOWED_RECEIPT_MIME_TYPES, MAX_RECEIPT_FILE_SIZE_BYTES} from '../../domain/upload-file.constants.js';
import {ApiResponse} from '../commons/api.response.js';
import {PublicPaymentRequest} from '../model/request/public-payment.request.js';
import {PaymentResponse} from '../model/response/payment.response.js';
import {PixInfoResponse} from '../model/response/pix-info.response.js';
import {PaymentMapper} from '../mapper/payment.mapper.js';


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
    @UseInterceptors(
        FileInterceptor('comprovante', {
            limits: {fileSize: MAX_RECEIPT_FILE_SIZE_BYTES},
            fileFilter: (_req, file, callback) => {
                if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.mimetype)) {
                    callback(
                        new BadRequestException(
                            'Formato de comprovante não suportado. Envie uma imagem (JPG, PNG, WEBP) ou um PDF.',
                        ),
                        false,
                    );
                    return;
                }
                callback(null, true);
            },
        }),
    )
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
            const fileInput = new UploadFileInput();
            fileInput.buffer = comprovante.buffer;
            fileInput.originalName = comprovante.originalname;
            fileInput.mimeType = comprovante.mimetype;
            context.putProperty('file', fileInput);
        }

        const saved = await this.registerPublicPaymentPort.execute(context);

        return ApiResponse.success(
            await this.paymentMapper.toResponse(saved),
            'Pagamento registrado! Assim que conferirmos o comprovante, ele será aprovado.',
        );
    }
}
