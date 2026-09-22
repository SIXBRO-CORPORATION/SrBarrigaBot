import {Command} from "../command.js";


export abstract class UploadFilePort extends Command<Promise<string>> {
}
