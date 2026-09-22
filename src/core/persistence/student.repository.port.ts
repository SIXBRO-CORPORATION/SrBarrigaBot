import {BaseRepositoryPort} from './commons/base.repository.port.js';
import {Student} from '../../domain/student.js';

export abstract class StudentRepositoryPort extends BaseRepositoryPort<Student> {
    abstract findAllActive(): Promise<Student[]>;
}
