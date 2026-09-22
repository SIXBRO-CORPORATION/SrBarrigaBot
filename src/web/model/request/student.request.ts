import {IsNotEmpty, IsString} from 'class-validator';

export class StudentRequest {
    @IsString()
    @IsNotEmpty({ message: 'O nome do aluno não pode estar vazio' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'O telefone do aluno não pode estar vazio' })
    phone: string;
}
