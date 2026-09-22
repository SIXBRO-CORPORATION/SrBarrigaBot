import {BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {RegisterPaymentPort} from '../../core/business/register-payment.port.js';
import {RemovePaymentPort} from '../../core/business/remove-payment.port.js';
import {PaymentRepositoryPort} from '../../core/persistence/payment.repository.port.js';
import {Context} from '../../core/context.js';
import {Payment} from '../../domain/payment.js';
import {UploadFileInput} from '../../domain/upload-file-input.js';
import {ALLOWED_RECEIPT_MIME_TYPES, MAX_RECEIPT_FILE_SIZE_BYTES} from '../../domain/upload-file.constants.js';
import {ApiResponse} from '../commons/api.response.js';
import {PaymentRequest} from '../model/request/payment.request.js';
import {PaymentResponse} from '../model/response/payment.response.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';
import {PaymentMapper} from '../mapper/payment.mapper.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class PaymentController {
    constructor(
        private readonly registerPaymentPort: RegisterPaymentPort,
        private readonly removePaymentPort: RemovePaymentPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly paymentMapper: PaymentMapper,
    ) {}

    @Post('students/:studentId/payments')
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
        @Param('studentId') studentId: string,
        @Body() request: PaymentRequest,
        @UploadedFile() comprovante?: Express.Multer.File,
    ): Promise<ApiResponse<PaymentResponse>> {
        const payment = new Payment();
        payment.studentId = studentId;
        payment.amount = request.amount;
        payment.paidAt = new Date(request.paidAt);
        payment.note = request.note ?? null;
        payment.receiptUrl = null;

        const context = new Context(payment);

        if (comprovante) {
            const fileInput = new UploadFileInput();
            fileInput.buffer = comprovante.buffer;
            fileInput.originalName = comprovante.originalname;
            fileInput.mimeType = comprovante.mimetype;
            fileInput.folder = `comprovantes/${studentId}`;
            context.putProperty('file', fileInput);
        }

        const saved = await this.registerPaymentPort.execute(context);

        return ApiResponse.success(await this.paymentMapper.toResponse(saved), 'Pagamento registrado com sucesso');
    }

    @Get('students/:studentId/payments')
    @HttpCode(HttpStatus.OK)
    async listByStudent(@Param('studentId') studentId: string): Promise<ApiResponse<PaymentResponse[]>> {
        const payments = await this.paymentRepositoryPort.findByStudentId(studentId);
        const responses = await Promise.all(payments.map((p) => this.paymentMapper.toResponse(p)));

        return ApiResponse.success(responses);
    }

    @Delete('payments/:id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse<PaymentResponse>> {
        const context = new Context();
        context.putProperty('id', id);

        const removed = await this.removePaymentPort.execute(context);

        return ApiResponse.success(await this.paymentMapper.toResponse(removed), 'Pagamento estornado com sucesso');
    }
}
