import {Command} from "../command.js";
import {Entry} from "../../domain/entry.js";

export abstract class CreateEntryPort extends Command<Promise<Entry>> {
}
