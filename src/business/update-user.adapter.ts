import {Injectable} from '@nestjs/common';
import {UpdateUserPort} from '../core/business/update-user.port.js';
import {Context} from '../core/context.js';
import {User} from '../domain/user.js';
import {BusinessException} from '../domain/exceptions/business.exception.js';
import {UserRepositoryPort} from '../core/persistence/user.repository.port.js';
import {PasswordEncoder} from '../security/configuration/password-encoder.configuration.js';

@Injectable()
export class UpdateUserAdapter implements UpdateUserPort {
    private readonly passwordEncoder = new PasswordEncoder();

    constructor(private readonly userRepositoryPort: UserRepositoryPort) {}

    async execute(context: Context): Promise<User> {
        const patch = context.getData(User);

        if (!patch || !patch.id) {
            throw new BusinessException('Por favor, informe o usuário a ser atualizado.');
        }

        const existing = await this.userRepositoryPort.get(patch.id);

        if (!existing || existing.deletedAt) {
            throw new BusinessException('Usuário não encontrado.');
        }

        if (patch.name !== undefined) {
            if (patch.name.trim() === '') {
                throw new BusinessException('O nome do usuário não pode ficar vazio.');
            }
            existing.name = patch.name.trim();
        }

        if (patch.email !== undefined) {
            const email = patch.email.trim();

            if (email === '') {
                throw new BusinessException('O e-mail do usuário não pode ficar vazio.');
            }

            if (email !== existing.email) {
                const emailExists = await this.userRepositoryPort.existsByEmail(email, existing.id);
                if (emailExists) {
                    throw new BusinessException('Já existe um usuário com esse email.');
                }
            }

            existing.email = email;
        }

        if (patch.password !== undefined) {
            if (patch.password.trim() === '') {
                throw new BusinessException('A senha do usuário não pode ficar vazia.');
            }
            existing.password = await this.passwordEncoder.encode(patch.password);
        }

        return await this.userRepositoryPort.save(existing);
    }
}