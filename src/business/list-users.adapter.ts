import {Injectable} from '@nestjs/common';
import {ListUsersPort} from '../core/business/list-users.port.js';
import {Context} from '../core/context.js';
import {User} from '../domain/user.js';
import {UserRepositoryPort} from '../core/persistence/user.repository.port.js';

@Injectable()
export class ListUsersAdapter implements ListUsersPort {
    constructor(private readonly userRepositoryPort: UserRepositoryPort) {}

    async execute(_context: Context): Promise<User[]> {
        return await this.userRepositoryPort.findAll();
    }
}