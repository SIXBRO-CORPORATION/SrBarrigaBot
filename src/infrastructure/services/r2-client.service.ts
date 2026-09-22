import {Injectable} from '@nestjs/common';
import {S3Client} from '@aws-sdk/client-s3';
import {config} from '../../security/configuration/env.js';

@Injectable()
export class R2ClientService {
    public readonly client: S3Client;
    public readonly bucketName: string;

    constructor() {
        this.bucketName = config.r2.bucketName!;
        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.r2.accessKeyId!,
                secretAccessKey: config.r2.secretAccessKey!,
            },
        });
    }
}
