import {Injectable} from '@nestjs/common';
import {UpdateStudentPort} from '../core/business/update-student.port.js';
import {Context} from '../core/context.js';
import {Student} from '../domain/student.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {StudentRepositoryPort} from '../core/persistence/student.repository.port.js';

@Injectable()
export class UpdateStudentAdapter implements UpdateStudentPort {
    constructor(private readonly studentRepositoryPort: StudentRepositoryPort) {}

    async execute(context: Context): Promise<Student> {
        const patch = context.getData(Student);

        if (!patch || !patch.id) {
            throw new BusinessException('Por favor, informe o aluno a ser atualizado.');
        }

        const existing = await this.studentRepositoryPort.get(patch.id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Aluno não encontrado.');
        }

        if (patch.name !== undefined) {
            if (patch.name.trim() === '') {
                throw new BusinessException('O nome do aluno não pode ficar vazio.');
            }
            existing.name = patch.name.trim();
        }

        if (patch.matricula !== undefined) {
            const matricula = patch.matricula.trim();

            if (matricula === '') {
                throw new BusinessException('A matrícula do aluno não pode ficar vazia.');
            }

            if (!/^[0-9]+$/.test(matricula)) {
                throw new BusinessException('A matrícula deve conter apenas números.');
            }

            if (matricula !== existing.matricula) {
                const matriculaExists = await this.studentRepositoryPort.existsByMatricula(matricula, existing.id);
                if (matriculaExists) {
                    throw new BusinessException('Já existe um aluno com essa matrícula.');
                }
            }

            existing.matricula = matricula;
        }

        if (patch.phone !== undefined) {
            if (patch.phone.trim() === '') {
                throw new BusinessException('O telefone do aluno não pode ficar vazio.');
            }
            existing.phone = patch.phone.trim();
        }

        return await this.studentRepositoryPort.save(existing);
    }
}
