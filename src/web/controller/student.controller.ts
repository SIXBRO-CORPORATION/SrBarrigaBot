import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CreateStudentPort} from '../../core/business/create-student.port.js';
import {UpdateStudentPort} from '../../core/business/update-student.port.js';
import {RemoveStudentPort} from '../../core/business/remove-student.port.js';
import {StudentRepositoryPort} from '../../core/persistence/student.repository.port.js';
import {Context} from '../../core/context.js';
import {Student} from '../../domain/student.js';
import {ApiResponse} from '../commons/api.response.js';
import {StudentRequest} from '../model/request/student.request.js';
import {StudentUpdateRequest} from '../model/request/student-update.request.js';
import {StudentResponse} from '../model/response/student.response.js';
import {BusinessException} from '../../domain/exceptions/business.exception.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
    constructor(
        private readonly createStudentPort: CreateStudentPort,
        private readonly updateStudentPort: UpdateStudentPort,
        private readonly removeStudentPort: RemoveStudentPort,
        private readonly studentRepositoryPort: StudentRepositoryPort,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() request: StudentRequest): Promise<ApiResponse<StudentResponse>> {
        const student = new Student();
        student.name = request.name;
        student.matricula = request.matricula;
        student.phone = request.phone;

        const context = new Context(student);
        const saved = await this.createStudentPort.execute(context);

        return ApiResponse.success(this.toResponse(saved), 'Aluno cadastrado com sucesso');
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async list(): Promise<ApiResponse<StudentResponse[]>> {
        const students = await this.studentRepositoryPort.findAllActive();
        return ApiResponse.success(students.map((s) => this.toResponse(s)));
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string): Promise<ApiResponse<StudentResponse>> {
        const student = await this.studentRepositoryPort.get(id);

        if (!student || student.deletedAt) {
            throw new BusinessException('Aluno não encontrado');
        }

        return ApiResponse.success(this.toResponse(student));
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() request: StudentUpdateRequest,
    ): Promise<ApiResponse<StudentResponse>> {
        const student = new Student();
        student.id = id;
        if (request.name !== undefined) student.name = request.name;
        if (request.matricula !== undefined) student.matricula = request.matricula;
        if (request.phone !== undefined) student.phone = request.phone;

        const context = new Context(student);
        const updated = await this.updateStudentPort.execute(context);

        return ApiResponse.success(this.toResponse(updated), 'Aluno atualizado com sucesso');
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse<StudentResponse>> {
        const context = new Context();
        context.putProperty('id', id);

        const removed = await this.removeStudentPort.execute(context);

        return ApiResponse.success(this.toResponse(removed), 'Aluno removido com sucesso');
    }

    private toResponse(student: Student): StudentResponse {
        return new StudentResponse({
            id: student.id,
            name: student.name,
            matricula: student.matricula,
            phone: student.phone,
            active: student.active,
            inactivatedAt: student.inactivatedAt,
            createdAt: student.createdAt,
        });
    }
}
