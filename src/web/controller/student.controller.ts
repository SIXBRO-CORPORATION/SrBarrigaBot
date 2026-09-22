import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CreateStudentPort} from '../../core/business/create-student.port.js';
import {UpdateStudentPort} from '../../core/business/update-student.port.js';
import {RemoveStudentPort} from '../../core/business/remove-student.port.js';
import {ListStudentsPort} from '../../core/business/list-students.port.js';
import {GetStudentDetailPort} from '../../core/business/get-student-detail.port.js';
import {Context} from '../../core/context.js';
import {Student} from '../../domain/student.js';
import {StudentSummary} from '../../domain/student-summary.js';
import {StudentDetail} from '../../domain/student-detail.js';
import {ApiResponse} from '../commons/api.response.js';
import {StudentRequest} from '../model/request/student.request.js';
import {StudentUpdateRequest} from '../model/request/student-update.request.js';
import {StudentResponse} from '../model/response/student.response.js';
import {StudentSummaryResponse} from '../model/response/student-summary.response.js';
import {StudentDetailResponse} from '../model/response/student-detail.response.js';
import {StudentMonthStatusResponse} from '../model/response/student-month-status.response.js';
import {PaymentResponse} from '../model/response/payment.response.js';
import {JwtAuthGuard} from '../../security/guards/jwt-auth.guard.js';
import {StudentMapper} from "../mapper/student.mapper.js";

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
    constructor(
        private readonly createStudentPort: CreateStudentPort,
        private readonly updateStudentPort: UpdateStudentPort,
        private readonly removeStudentPort: RemoveStudentPort,
        private readonly listStudentsPort: ListStudentsPort,
        private readonly getStudentDetailPort: GetStudentDetailPort,
        private readonly studentMapper: StudentMapper,
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

        return ApiResponse.success(this.studentMapper.toResponse(saved), 'Aluno cadastrado com sucesso');
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async list(): Promise<ApiResponse<StudentSummaryResponse[]>> {
        const context = new Context();
        const summaries = await this.listStudentsPort.execute(context);

        return ApiResponse.success(summaries.map((s) => this.studentMapper.toSummaryResponse(s)));
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string): Promise<ApiResponse<StudentDetailResponse>> {
        const context = new Context();
        context.putProperty('id', id);

        const detail = await this.getStudentDetailPort.execute(context);

        return ApiResponse.success(await this.studentMapper.toDetailResponse(detail));
    }

    @Get(':id/timeline')
    @HttpCode(HttpStatus.OK)
    async timeline(@Param('id') id: string): Promise<ApiResponse<StudentMonthStatusResponse[]>> {
        const context = new Context();
        context.putProperty('id', id);

        const detail = await this.getStudentDetailPort.execute(context);

        return ApiResponse.success(
            detail.statusMesAMes.map(
                (m) => new StudentMonthStatusResponse({ numero: m.numero, referencia: m.referencia, status: m.status }),
            ),
        );
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

        return ApiResponse.success(this.studentMapper.toResponse(updated), 'Aluno atualizado com sucesso');
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<ApiResponse<StudentResponse>> {
        const context = new Context();
        context.putProperty('id', id);

        const removed = await this.removeStudentPort.execute(context);

        return ApiResponse.success(this.studentMapper.toResponse(removed), 'Aluno removido com sucesso');
    }
}
