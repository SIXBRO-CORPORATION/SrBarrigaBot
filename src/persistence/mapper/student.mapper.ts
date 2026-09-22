import {Injectable} from '@nestjs/common';
import {Student as PrismaStudent} from '../../../generated/prisma/client.js';
import {Student} from '../../domain/student.js';

@Injectable()
export class StudentMapper {
    toDomain(entity: PrismaStudent): Student {
        const student = new Student();
        student.id = entity.id;
        student.name = entity.name;
        student.matricula = entity.matricula;
        student.phone = entity.phone;
        student.active = entity.active;
        student.inactivatedAt = entity.inactivatedAt;
        student.createdAt = entity.createdAt;
        student.modifiedAt = entity.modifiedAt;
        student.deletedAt = entity.deletedAt;
        return student;
    }

    toEntity(domain: Student): PrismaStudent {
        return {
            id: domain.id,
            name: domain.name,
            matricula: domain.matricula,
            phone: domain.phone,
            active: domain.active,
            inactivatedAt: domain.inactivatedAt,
            createdAt: domain.createdAt,
            modifiedAt: domain.modifiedAt,
            deletedAt: domain.deletedAt,
        };
    }
}
