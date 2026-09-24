import {Type} from 'class-transformer';
import {IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString} from 'class-validator';

// Enviado como multipart/form-data (o comprovante vai no campo de arquivo "comprovante").
export class PublicPaymentRequest {
    @IsNotEmpty({ message: 'Por favor, informe sua matrícula' })
    @IsString()
    matricula: string;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor do pagamento deve ser numérico, com até 2 casas decimais' })
    @IsPositive({ message: 'O valor do pagamento deve ser maior que zero' })
    amount: number;

    // Opcional: se não vier, assume o momento do envio do formulário.
    @IsOptional()
    @IsDateString({}, { message: 'Por favor, informe uma data de pagamento válida' })
    paidAt?: string;

    @IsOptional()
    @IsString()
    note?: string;
}
