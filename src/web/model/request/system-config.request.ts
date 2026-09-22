import {IsNotEmpty, IsString} from 'class-validator';

export class SystemConfigRequest {
    @IsString()
    @IsNotEmpty({ message: 'A chave de configuração não pode estar vazia' })
    key: string;

    @IsString()
    @IsNotEmpty({ message: 'O valor da configuração não pode estar vazio' })
    value: string;
}
