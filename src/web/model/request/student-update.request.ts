import {IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class StudentUpdateRequest {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'O nome do aluno não pode estar vazio' })
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'O telefone do aluno não pode estar vazio' })
    phone?: string;
}
