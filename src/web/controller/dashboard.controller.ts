import {Controller, Get, HttpCode, HttpStatus, UseGuards} from '@nestjs/common';
import {GetDashboardSummaryPort} from '../../core/business/get-dashboard-summary.port.js';
import {Context} from '../../core/context.js';
import {DashboardSummary} from '../../domain/dashboard-summary.js';
import {ApiResponse} from '../commons/api.response.js';
import {DashboardSummaryResponse} from '../model/response/dashboard-summary.response.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly getDashboardSummaryPort: GetDashboardSummaryPort) {}

    @Get('summary')
    @HttpCode(HttpStatus.OK)
    async summary(): Promise<ApiResponse<DashboardSummaryResponse>> {
        const context = new Context();
        const summary = await this.getDashboardSummaryPort.execute(context);

        return ApiResponse.success(this.toResponse(summary));
    }

    private toResponse(summary: DashboardSummary): DashboardSummaryResponse {
        return new DashboardSummaryResponse({
            alunosAtivos: summary.alunosAtivos,
            mensalidade: summary.mensalidade,
            metaMensal: summary.metaMensal,
            arrecadadoNoMes: summary.arrecadadoNoMes,
            valorEsperadoTotal: summary.valorEsperadoTotal,
            valorContribuidoTotal: summary.valorContribuidoTotal,
            diferencaTotal: summary.diferencaTotal,
        });
    }
}
