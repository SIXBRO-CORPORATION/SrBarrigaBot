import {IsOptional, IsString} from 'class-validator';

export class RejectPaymentRequest {
    @IsOptional()
    @IsString()
    reason?: string;
}
