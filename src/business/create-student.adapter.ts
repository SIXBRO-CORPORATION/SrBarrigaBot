import {Injectable} from '@nestjs/common';
import {CreateStudentPort} from '../core/business/create-student.port.js';
import {Context} from '../core/context.js';
import {Student} from '../domain/student.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';

@Injectable()
export class CreateStudentAdapter implements CreateStudentPort {
    constructor(private readonly studentRepositoryPort: StudentRepositoryPort) {}

    async execute(context: Context): Promise<Student> {
        const data = context.getData(Student);

        if (!data) {
            throw new BusinessException('Por favor, informe os dados do aluno.');
        }

        if (!data.name || data.name.trim() === '') {
            throw new BusinessException('Por favor, informe o nome do aluno.');
        }

        if (!data.matricula || data.matricula.trim() === '') {
            throw new BusinessException('Por favor, informe a matrícula do aluno.');
        }

        const matricula = data.matricula.trim();

        if (!/^[0-9]+$/.test(matricula)) {
            throw new BusinessException('A matrícula deve conter apenas números.');
        }

        if (!data.phone || data.phone.trim() === '') {
            throw new BusinessException('Por favor, informe o telefone do aluno.');
        }

        const existing = await this.studentRepositoryPort.findByMatriculaIncludingDeleted(matricula);
        if (existing && !existing.deletedAt) {
            throw new BusinessException('Já existe um aluno com essa matrícula.');
        }

        const now = new Date();
        const student = existing ?? new Student();
        student.name = data.name.trim();
        student.matricula = matricula;
        student.phone = data.phone.trim();
        student.active = true;
        student.inactivatedAt = null;
        student.deletedAt = null;
        student.createdAt ??= now;
        student.modifiedAt = now;

        return await this.studentRepositoryPort.save(student);
    }
}
