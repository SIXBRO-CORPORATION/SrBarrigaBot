import {IsNotEmpty, IsOptional, IsString, Matches} from 'class-validator';

export class StudentUpdateRequest {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'O nome do aluno não pode estar vazio' })
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'A matrícula do aluno não pode estar vazia' })
    @Matches(/^[0-9]+$/, { message: 'A matrícula deve conter apenas números' })
    matricula?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'O telefone do aluno não pode estar vazio' })
    phone?: string;
}
