import {Command} from "../command.js";
import {Entry} from "../../domain/entry.js";

export abstract class RemoveEntryPort extends Command<Promise<Entry>> {
}
