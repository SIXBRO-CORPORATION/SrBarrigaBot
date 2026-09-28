import {Module} from '@nestjs/common';
import {UploadFilePort} from "../../core/infrastructure/upload-file.port.js";
import {GetFileSignedUrlPort} from "../../core/infrastructure/get-file-signed-url.port.js";
import {R2ClientService} from "../services/r2-client.service.js";
import {R2UploadFileAdapter} from "../adapters/r2-upload-file.adapter.js";
import {R2GetFileSignedUrlAdapter} from "../adapters/r2-get-file-signed-url.adapter.js";

@Module({
    providers: [
        R2ClientService,
        {
            provide: UploadFilePort,
            useClass: R2UploadFileAdapter,
        },
        {
            provide: GetFileSignedUrlPort,
            useClass: R2GetFileSignedUrlAdapter,
        },
    ],
    exports: [UploadFilePort, GetFileSignedUrlPort],
})
export class InfrastructureModule {}