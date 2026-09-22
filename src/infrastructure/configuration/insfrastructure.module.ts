import {Module} from '@nestjs/common';
import {GetPeopleFromSheetPort} from "../../core/infrastructure/get-people-from-sheet.port.js";
import {GoogleSheetsService} from "../services/google-sheets.service.js";
import {GetPeopleFromSheetAdapter} from "../adapters/get-people-from-sheet.adapter.js";
import {UploadFilePort} from "../../core/infrastructure/upload-file.port.js";
import {GetFileSignedUrlPort} from "../../core/infrastructure/get-file-signed-url.port.js";
import {R2ClientService} from "../services/r2-client.service.js";
import {R2UploadFileAdapter} from "../adapters/r2-upload-file.adapter.js";
import {R2GetFileSignedUrlAdapter} from "../adapters/r2-get-file-signed-url.adapter.js";

@Module({
    providers: [
        GoogleSheetsService,
        R2ClientService,
        {
            provide: GetPeopleFromSheetPort,
            useClass: GetPeopleFromSheetAdapter,
        },
        {
            provide: UploadFilePort,
            useClass: R2UploadFileAdapter,
        },
        {
            provide: GetFileSignedUrlPort,
            useClass: R2GetFileSignedUrlAdapter,
        },
    ],
    exports: [GetPeopleFromSheetPort, UploadFilePort, GetFileSignedUrlPort],
})
export class InfrastructureModule {}