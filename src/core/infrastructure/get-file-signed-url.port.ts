import {Command} from "../command.js";


export abstract class GetFileSignedUrlPort extends Command<Promise<string | null>> {
}
