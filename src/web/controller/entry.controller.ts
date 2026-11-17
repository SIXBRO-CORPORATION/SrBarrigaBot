import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CreateEntryPort} from '../../core/business/create-entry.port.js';
import {UpdateEntryPort} from '../../core/business/update-entry.port.js';
import {RemoveEntryPort} from '../../core/business/remove-entry.port.js';
import {ListEntriesPort} from '../../core/business/list-entries.port.js';
import {EntryRepositoryPort} from '../../core/persistence/entry.repository.port.js';
import {Context} from '../../core/context.js';
import {Entry} from '../../domain/entry.js';
import {BusinessException} from '../../domain/exceptions/business.exception.js';
import {ApiResponse} from '../commons/api.response.js';
import {EntryRequest} from '../model/request/entry.request.js';
import {EntryUpdateRequest} from '../model/request/entry-update.request.js';
import {EntryResponse} from '../model/response/entry.response.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';

@Controller('entries')
@UseGuards(JwtAuthGuard)
export class EntryController {
    constructor(
        private readonly createEntryPort: CreateEntryPort,
        private readonly updateEntryPort: UpdateEntryPort,
        private readonly removeEntryPort: RemoveEntryPort,
        private readonly listEntriesPort: ListEntriesPort,
        private readonly entryRepositoryPort: EntryRepositoryPort,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() request: EntryRequest): Promise<ApiResponse<EntryResponse>> {
        const entry = new Entry();
        entry.type = request.type;
        entry.title = request.title;
        entry.details = request.details ?? null;
        entry.amount = request.amount;

        const saved = await this.createEntryPort.execute(new Context(entry));

        return ApiResponse.success(this.toResponse(saved), 'Lançamento criado com sucesso');
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async list(): Promise<ApiResponse<EntryResponse[]>> {
        const entries = await this.listEntriesPort.execute(new Context());

        return ApiResponse.success(entries.map((e) => this.toResponse(e)));
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string): Promise<ApiResponse<EntryResponse>> {
        const entry = await this.entryRepositoryPort.get(id);

        if (!entry) {
            throw new BusinessException('Lançamento não encontrado.');
        }

        return ApiResponse.success(this.toResponse(entry));
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() request: EntryUpdateRequest): Promise<ApiResponse<EntryResponse>> {
        const entry = new Entry();
        entry.id = id;
        if (request.type !== undefined) entry.type = request.type;
        if (request.title !== undefined) entry.title = request.title;
        if (request.details !== undefined) entry.details = request.details;
        if (request.amount !== undefined) entry.amount = request.amount;

        const updated = await this.updateEntryPort.execute(new Context(entry));

        return ApiResponse.success(this.toResponse(updated), 'Lançamento atualizado com sucesso');
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse<EntryResponse>> {
        const context = new Context();
        context.putProperty('id', id);

        const removed = await this.removeEntryPort.execute(context);

        return ApiResponse.success(this.toResponse(removed), 'Lançamento removido com sucesso');
    }

    private toResponse(entry: Entry): EntryResponse {
        return new EntryResponse({
            id: entry.id,
            type: entry.type,
            title: entry.title,
            details: entry.details,
            amount: entry.amount,
            createdAt: entry.createdAt,
        });
    }
}
