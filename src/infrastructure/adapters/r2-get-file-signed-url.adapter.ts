import {Injectable, Logger} from '@nestjs/common';
import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {GetFileSignedUrlPort} from '../../core/infrastructure/get-file-signed-url.port.js';
import {Context} from '../../core/context.js';
import {R2ClientService} from '../services/r2-client.service.js';
import {config} from '../../security/configuration/env.js';

@Injectable()
export class R2GetFileSignedUrlAdapter implements GetFileSignedUrlPort {
    private readonly logger = new Logger(R2GetFileSignedUrlAdapter.name);

    constructor(private readonly r2ClientService: R2ClientService) {}

    async execute(context: Context): Promise<string | null> {
        const key = context.getProperty<string>('key');

        if (!key) {
            return null;
        }

        try {
            const command = new GetObjectCommand({
                Bucket: this.r2ClientService.bucketName,
                Key: key,
            });

            return await getSignedUrl(this.r2ClientService.client, command, {
                expiresIn: config.r2.signedUrlExpirationSeconds,
            });
        } catch (error) {
            this.logger.error(`Falha ao gerar URL assinada para o comprovante "${key}"`, error as Error);
            return null;
        }
    }
}
