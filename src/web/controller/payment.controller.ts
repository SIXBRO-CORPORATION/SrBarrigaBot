import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {RegisterPaymentPort} from '../../core/business/register-payment.port.js';
import {RemovePaymentPort} from '../../core/business/remove-payment.port.js';
import {ApprovePaymentPort} from '../../core/business/approve-payment.port.js';
import {RejectPaymentPort} from '../../core/business/reject-payment.port.js';
import {ListPendingPaymentsPort} from '../../core/business/list-pending-payments.port.js';
import {PaymentRepositoryPort} from '../../core/persistence/payment.repository.port.js';
import {Context} from '../../core/context.js';
import {Payment} from '../../domain/payment.js';
import {ApiResponse} from '../commons/api.response.js';
import {PaymentRequest} from '../model/request/payment.request.js';
import {RejectPaymentRequest} from '../model/request/reject-payment.request.js';
import {PaymentResponse} from '../model/response/payment.response.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';
import {PaymentMapper} from '../mapper/payment.mapper.js';
import {receiptFileInterceptor, toUploadFileInput} from '../commons/receipt-file.interceptor.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class PaymentController {
    constructor(
        private readonly registerPaymentPort: RegisterPaymentPort,
        private readonly removePaymentPort: RemovePaymentPort,
        private readonly approvePaymentPort: ApprovePaymentPort,
        private readonly rejectPaymentPort: RejectPaymentPort,
        private readonly listPendingPaymentsPort: ListPendingPaymentsPort,
        private readonly paymentRepositoryPort: PaymentRepositoryPort,
        private readonly paymentMapper: PaymentMapper,
    ) {}

    @Post('students/:studentId/payments')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(receiptFileInterceptor)
    async register(
        @Param('studentId') studentId: string,
        @Body() request: PaymentRequest,
        @Req() req: any,
        @UploadedFile() comprovante?: Express.Multer.File,
    ): Promise<ApiResponse<PaymentResponse>> {
        const payment = new Payment();
        payment.studentId = studentId;
        payment.amount = request.amount;
        payment.paidAt = new Date(request.paidAt);
        payment.note = request.note ?? null;
        payment.receiptUrl = null;

        const context = new Context(payment);
        context.putProperty('approvedBy', req.user?.id ?? null);

        if (comprovante) {
            context.putProperty('file', toUploadFileInput(comprovante));
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

    @Get('payments/pending')
    @HttpCode(HttpStatus.OK)
    async listPending(): Promise<ApiResponse<PaymentResponse[]>> {
        const payments = await this.listPendingPaymentsPort.execute(new Context());
        const responses = await Promise.all(payments.map((p) => this.paymentMapper.toResponse(p)));

        return ApiResponse.success(responses);
    }

    @Patch('payments/:id/approve')
    @HttpCode(HttpStatus.OK)
    async approve(@Param('id') id: string, @Req() req: any): Promise<ApiResponse<PaymentResponse>> {
        const context = new Context();
        context.putProperty('id', id);
        context.putProperty('approvedBy', req.user?.id ?? null);

        const approved = await this.approvePaymentPort.execute(context);

        return ApiResponse.success(await this.paymentMapper.toResponse(approved), 'Pagamento aprovado com sucesso');
    }

    @Patch('payments/:id/reject')
    @HttpCode(HttpStatus.OK)
    async reject(
        @Param('id') id: string,
        @Body() request: RejectPaymentRequest,
    ): Promise<ApiResponse<PaymentResponse>> {
        const context = new Context();
        context.putProperty('id', id);
        context.putProperty('reason', request.reason ?? null);

        const rejected = await this.rejectPaymentPort.execute(context);

        return ApiResponse.success(await this.paymentMapper.toResponse(rejected), 'Pagamento rejeitado');
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
