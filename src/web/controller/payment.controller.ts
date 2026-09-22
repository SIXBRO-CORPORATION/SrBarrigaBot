import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards} from '@nestjs/common';
import {RegisterPaymentPort} from '../../core/business/register-payment.port.js';
import {RemovePaymentPort} from '../../core/business/remove-payment.port.js';
import {PaymentRepositoryPort} from '../../core/persistence/payment.repository.port.js';
import {Context} from '../../core/context.js';
import {Payment} from '../../domain/payment.js';
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
    async register(
        @Param('studentId') studentId: string,
        @Body() request: PaymentRequest,
    ): Promise<ApiResponse<PaymentResponse>> {
        const payment = new Payment();
        payment.studentId = studentId;
        payment.amount = request.amount;
        payment.paidAt = new Date(request.paidAt);
        payment.note = request.note ?? null;
        payment.receiptUrl = request.receiptUrl ?? null;

        const context = new Context(payment);
        const saved = await this.registerPaymentPort.execute(context);

        return ApiResponse.success(this.paymentMapper.toResponse(saved), 'Pagamento registrado com sucesso');
    }

    @Get('students/:studentId/payments')
    @HttpCode(HttpStatus.OK)
    async listByStudent(@Param('studentId') studentId: string): Promise<ApiResponse<PaymentResponse[]>> {
        const payments = await this.paymentRepositoryPort.findByStudentId(studentId);

        return ApiResponse.success(payments.map((p) => this.paymentMapper.toResponse(p)));
    }

    @Delete('payments/:id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse<PaymentResponse>> {
        const context = new Context();
        context.putProperty('id', id);

        const removed = await this.removePaymentPort.execute(context);

        return ApiResponse.success(this.paymentMapper.toResponse(removed), 'Pagamento estornado com sucesso');
    }
}
