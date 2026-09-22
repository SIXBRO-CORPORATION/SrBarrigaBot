import {Type} from 'class-transformer';
import {IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString} from 'class-validator';

// Enviado como multipart/form-data (o comprovante vai no campo de arquivo "comprovante").
// Por isso amount chega como string e precisa de @Type para virar number antes da validação.
export class PaymentRequest {
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor do pagamento deve ser numérico, com até 2 casas decimais' })
    @IsPositive({ message: 'O valor do pagamento deve ser maior que zero' })
    amount: number;

    @IsDateString({}, { message: 'Por favor, informe uma data de pagamento válida' })
    @IsNotEmpty({ message: 'A data do pagamento não pode estar vazia' })
    paidAt: string;

    @IsOptional()
    @IsString()
    note?: string;
}
