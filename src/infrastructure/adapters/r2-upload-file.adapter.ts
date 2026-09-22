import {Injectable} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import {UploadFilePort} from '../../core/infrastructure/upload-file.port.js';
import {Context} from '../../core/context.js';
import {UploadFileInput} from '../../domain/upload-file-input.js';
import {BusinessException} from '../../domain/exceptions/business.exception.js';
import {ALLOWED_RECEIPT_MIME_TYPES, MAX_RECEIPT_FILE_SIZE_BYTES} from '../../domain/upload-file.constants.js';
import {R2ClientService} from '../services/r2-client.service.js';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
};

@Injectable()
export class R2UploadFileAdapter implements UploadFilePort {
    constructor(private readonly r2ClientService: R2ClientService) {}

    async execute(context: Context): Promise<string> {
        const input = context.getData(UploadFileInput);

        if (!input || !input.buffer || input.buffer.length === 0) {
            throw new BusinessException('Por favor, envie um arquivo de comprovante válido.');
        }

        if (!ALLOWED_RECEIPT_MIME_TYPES.includes(input.mimeType)) {
            throw new BusinessException('Formato de comprovante não suportado. Envie uma imagem (JPG, PNG, WEBP) ou um PDF.');
        }

        if (input.buffer.length > MAX_RECEIPT_FILE_SIZE_BYTES) {
            throw new BusinessException('O comprovante deve ter no máximo 10MB.');
        }

        const key = `${input.folder}/${randomUUID()}${this.resolveExtension(input)}`;

        await this.r2ClientService.client.send(
            new PutObjectCommand({
                Bucket: this.r2ClientService.bucketName,
                Key: key,
                Body: input.buffer,
                ContentType: input.mimeType,
            }),
        );

        return key;
    }

    private resolveExtension(input: UploadFileInput): string {
        const fromOriginalName = input.originalName?.includes('.')
            ? input.originalName.slice(input.originalName.lastIndexOf('.')).toLowerCase()
            : '';

        return fromOriginalName || EXTENSION_BY_MIME_TYPE[input.mimeType] || '';
    }
}
