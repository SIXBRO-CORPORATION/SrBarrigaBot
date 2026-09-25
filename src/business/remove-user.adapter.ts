import {Injectable} from '@nestjs/common';
import {RemoveUserPort} from '../core/business/remove-user.port.js';
import {Context} from '../core/context.js';
import {User} from '../domain/user.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {UserRepositoryPort} from '../core/persistence/user.repository.port.js';

@Injectable()
export class RemoveUserAdapter implements RemoveUserPort {
    constructor(private readonly userRepositoryPort: UserRepositoryPort) {}

    async execute(context: Context): Promise<User> {
        const id = context.getProperty<string>('id', String);
        const currentUserId = context.getProperty<string>('currentUserId', String);

        if (!id) {
            throw new BusinessException('Por favor, informe o usuário a ser removido.');
        }

        if (currentUserId && currentUserId === id) {
            throw new BusinessException('Você não pode excluir o seu próprio usuário.');
        }

        const existing = await this.userRepositoryPort.get(id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Usuário não encontrado.');
        }

        return await this.userRepositoryPort.softDelete(existing);
    }
}