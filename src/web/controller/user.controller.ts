import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {CreateUserPort} from '../../core/business/create-user.port.js';
import {ListUsersPort} from '../../core/business/list-users.port.js';
import {GetUserPort} from '../../core/business/get-user.port.js';
import {UpdateUserPort} from '../../core/business/update-user.port.js';
import {RemoveUserPort} from '../../core/business/remove-user.port.js';
import {Context} from '../../core/context.js';
import {User} from '../../domain/user.js';
import {ApiResponse} from '../commons/api.response.js';
import {UserRequest} from '../model/request/user.request.js'
import {UserUpdateRequest} from '../model/request/user-update.request.js';
import {UserResponse} from "../model/response/user.response.js";
import {UserRepositoryPort} from "../../core/persistence/user.repository.port.js";
import {BusinessException} from "../../domain/exceptions/business.exception.js";
import {JwtAuthGuard} from "../../security/guards/jwt-auth.guard.js";
import {UserMapper} from "../mapper/user.mapper.js";

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        private readonly createUserPort: CreateUserPort,
        private readonly listUsersPort: ListUsersPort,
        private readonly getUserPort: GetUserPort,
        private readonly updateUserPort: UpdateUserPort,
        private readonly removeUserPort: RemoveUserPort,
        private readonly userRepositoryPort: UserRepositoryPort,
        private readonly mapper: UserMapper,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() request: UserRequest): Promise<ApiResponse<UserResponse>> {
        const user = new User();
        user.name = request.name;
        user.email = request.email;
        user.password = request.password;

        const context = new Context(user);
        const savedUser = await this.createUserPort.execute(context);

        const response: UserResponse = new UserResponse({
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            createdAt: savedUser.createdAt,
        });

        return ApiResponse.success(response, 'Usuário criado com sucesso');
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    async me(@Req() req: any): Promise<ApiResponse<UserResponse>> {
        const userId = req.user.id;
        const user = await this.userRepositoryPort.get(userId);

        if (!user) {
            throw new BusinessException('Usuário não encontrado');
        }

        const response: UserResponse = new UserResponse({
            id: userId,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        });

        return ApiResponse.success(response)
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async list(): Promise<ApiResponse<UserResponse[]>> {
        const context = new Context();
        const users = await this.listUsersPort.execute(context);

        return ApiResponse.success(users.map((user) => this.mapper.toResponse(user)));
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string): Promise<ApiResponse<UserResponse>> {
        const context = new Context();
        context.putProperty('id', id);

        const user = await this.getUserPort.execute(context);

        return ApiResponse.success(this.mapper.toResponse(user));
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() request: UserUpdateRequest,
    ): Promise<ApiResponse<UserResponse>> {
        const user = new User();
        user.id = id;
        if (request.name !== undefined) user.name = request.name;
        if (request.email !== undefined) user.email = request.email;
        if (request.password !== undefined) user.password = request.password;

        const context = new Context(user);
        const updated = await this.updateUserPort.execute(context);

        return ApiResponse.success(this.mapper.toResponse(updated), 'Usuário atualizado com sucesso');
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string, @Req() req: any): Promise<ApiResponse<UserResponse>> {
        const context = new Context();
        context.putProperty('id', id);
        context.putProperty('currentUserId', req.user.id);

        const removed = await this.removeUserPort.execute(context);

        return ApiResponse.success(this.mapper.toResponse(removed), 'Usuário removido com sucesso');
    }
}