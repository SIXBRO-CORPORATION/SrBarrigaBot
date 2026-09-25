import {BaseRepositoryPort} from './commons/base.repository.port.js';
import {User} from '../../domain/user.js';

export abstract class UserRepositoryPort extends BaseRepositoryPort<User> {
    abstract findByEmail(email: string): Promise<User | null>;
    abstract existsByEmail(email: string, excludeUserId?: string): Promise<boolean>;
}