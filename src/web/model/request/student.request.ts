import {IsNotEmpty, IsString, Matches} from 'class-validator';

export class StudentRequest {
    @IsString()
    @IsNotEmpty({ message: 'O nome do aluno não pode estar vazio' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'A matrícula do aluno não pode estar vazia' })
    @Matches(/^[0-9]+$/, { message: 'A matrícula deve conter apenas números' })
    matricula: string;

    @IsString()
    @IsNotEmpty({ message: 'O telefone do aluno não pode estar vazio' })
    phone: string;
}
