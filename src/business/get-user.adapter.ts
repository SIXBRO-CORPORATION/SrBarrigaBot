import {Injectable} from '@nestjs/common';
import {GetUserPort} from '../core/business/get-user.port.js';
import {Context} from '../core/context.js';
import {User} from '../domain/user.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {UserRepositoryPort} from '../core/persistence/user.repository.port.js';

@Injectable()
export class GetUserAdapter implements GetUserPort {
    constructor(private readonly userRepositoryPort: UserRepositoryPort) {}

    async execute(context: Context): Promise<User> {
        const id = context.getProperty<string>('id', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o usuário.');
        }

        const user = await this.userRepositoryPort.get(id);

        if (!user || user.deletedAt) {
            throw new BusinessException('Usuário não encontrado.');
        }

        return user;
    }
}