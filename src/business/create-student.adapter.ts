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
        const student = context.getData(Student);

        if (!student) {
            throw new BusinessException('Por favor, informe os dados do aluno.');
        }

        if (!student.name || student.name.trim() === '') {
            throw new BusinessException('Por favor, informe o nome do aluno.');
        }

        if (!student.phone || student.phone.trim() === '') {
            throw new BusinessException('Por favor, informe o telefone do aluno.');
        }

        const newStudent = new Student();
        newStudent.name = student.name.trim();
        newStudent.phone = student.phone.trim();
        newStudent.active = true;
        newStudent.inactivatedAt = null;
        newStudent.createdAt = new Date();
        newStudent.modifiedAt = new Date();

        return await this.studentRepositoryPort.save(newStudent);
    }
}
