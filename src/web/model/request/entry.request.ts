import {IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString} from 'class-validator';

export class EntryRequest {
    @IsIn(['GASTO', 'LUCRO'], { message: 'O tipo deve ser GASTO ou LUCRO' })
    type: 'GASTO' | 'LUCRO';

    @IsString()
    @IsNotEmpty({ message: 'O título não pode estar vazio' })
    title: string;

    @IsOptional()
    @IsString()
    details?: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor deve ser numérico, com até 2 casas decimais' })
    @IsPositive({ message: 'O valor deve ser maior que zero' })
    amount: number;
}
