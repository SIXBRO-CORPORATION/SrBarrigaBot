import {Injectable} from '@nestjs/common';
import {StudentRepositoryPort} from '../../core/persistence/student.repository.port.js';
import {Student} from '../../domain/student.js';
import {PrismaConfiguration} from '../configuration/prisma.configuration.js';
import {StudentMapper} from '../mapper/student.mapper.js';

@Injectable()
export class StudentRepositoryAdapter implements StudentRepositoryPort {
    constructor(
        private readonly prisma: PrismaConfiguration,
        private readonly mapper: StudentMapper,
    ) {}

    async get(id: string): Promise<Student | null> {
        const entity = await this.prisma.student.findUnique({ where: { id } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<Student[]> {
        const entities = await this.prisma.student.findMany();
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async findAllActive(): Promise<Student[]> {
        const entities = await this.prisma.student.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
        return entities.map((e) => this.mapper.toDomain(e));
    }

    async save(model: Student): Promise<Student> {
        const data = this.mapper.toEntity(model);

        const saved = model.id
            ? await this.prisma.student.update({ where: { id: model.id }, data })
            : await this.prisma.student.create({ data });

        return this.mapper.toDomain(saved);
    }

    async delete(model: Student): Promise<Student> {
        const deleted = await this.prisma.student.delete({
            where: { id: model.id },
        });
        return this.mapper.toDomain(deleted);
    }

    async softDelete(model: Student): Promise<Student> {
        const deleted = await this.prisma.student.update({
            where: { id: model.id },
            data: { deletedAt: new Date() },
        });
        return this.mapper.toDomain(deleted);
    }
}
