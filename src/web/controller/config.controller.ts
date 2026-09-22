import {Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards} from '@nestjs/common';
import {UpdateSystemConfigPort} from '../../core/business/update-system-config.port.js';
import {SystemConfigRepositoryPort} from '../../core/persistence/system-config.repository.port.js';
import {Context} from '../../core/context.js';
import {SystemConfig} from '../../domain/system-config.js';
import {ApiResponse} from '../commons/api.response.js';
import {SystemConfigRequest} from '../model/request/system-config.request.js';
import {SystemConfigResponse} from '../model/response/system-config.response.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';


@Controller('config')
@UseGuards(JwtAuthGuard)
export class ConfigController {
    constructor(
        private readonly updateSystemConfigPort: UpdateSystemConfigPort,
        private readonly systemConfigRepositoryPort: SystemConfigRepositoryPort,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async list(): Promise<ApiResponse<SystemConfigResponse[]>> {
        const configs = await this.systemConfigRepositoryPort.findAll();
        return ApiResponse.success(configs.map((c) => this.toResponse(c)));
    }

    @Patch()
    @HttpCode(HttpStatus.OK)
    async update(@Body() request: SystemConfigRequest): Promise<ApiResponse<SystemConfigResponse>> {
        const config = new SystemConfig();
        config.key = request.key;
        config.value = request.value;

        const context = new Context(config);
        const updated = await this.updateSystemConfigPort.execute(context);

        return ApiResponse.success(this.toResponse(updated), 'Configuração atualizada com sucesso');
    }

    private toResponse(config: SystemConfig): SystemConfigResponse {
        return new SystemConfigResponse({
            key: config.key,
            value: config.value,
            modifiedAt: config.modifiedAt,
        });
    }
}
