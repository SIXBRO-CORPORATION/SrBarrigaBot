import {BadRequestException} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {UploadFileInput} from '../../domain/upload-file-input.js';
import {ALLOWED_RECEIPT_MIME_TYPES, MAX_RECEIPT_FILE_SIZE_BYTES} from '../../domain/upload-file.constants.js';

export const receiptFileInterceptor = FileInterceptor('comprovante', {
    limits: {fileSize: MAX_RECEIPT_FILE_SIZE_BYTES},
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.mimetype)) {
            callback(
                new BadRequestException(
                    'Formato de comprovante não suportado. Envie uma imagem (JPG, PNG, WEBP) ou um PDF.',
                ),
                false,
            );
            return;
        }
        callback(null, true);
    },
});

export function toUploadFileInput(file: Express.Multer.File): UploadFileInput {
    const input = new UploadFileInput();
    input.buffer = file.buffer;
    input.originalName = file.originalname;
    input.mimeType = file.mimetype;
    return input;
}
