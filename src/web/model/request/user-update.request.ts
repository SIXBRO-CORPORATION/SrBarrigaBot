import {IsEmail, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator';

export class UserUpdateRequest {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'O nome não pode estar vazio' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'O e-mail deve ser um endereço válido' })
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    password?: string;
}