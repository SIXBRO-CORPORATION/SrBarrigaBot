import {Injectable} from '@nestjs/common';
import {RemoveStudentPort} from '../core/business/remove-student.port.js';
import {Context} from '../core/context.js';
import {Student} from '../domain/student.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';

@Injectable()
export class RemoveStudentAdapter implements RemoveStudentPort {
    constructor(private readonly studentRepositoryPort: StudentRepositoryPort) {}

    async execute(context: Context): Promise<Student> {
        const id = context.getProperty<string>('id', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o aluno a ser removido.');
        }

        const existing = await this.studentRepositoryPort.get(id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Aluno não encontrado.');
        }

        const now = new Date();
        existing.active = false;
        existing.inactivatedAt = now;
        existing.deletedAt = now;

        return await this.studentRepositoryPort.save(existing);
    }
}
