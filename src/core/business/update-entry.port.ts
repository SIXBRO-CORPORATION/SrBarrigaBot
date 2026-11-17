import {Command} from "../command.js";
import {Entry} from "../../domain/entry.js";

export abstract class UpdateEntryPort extends Command<Promise<Entry>> {
}
