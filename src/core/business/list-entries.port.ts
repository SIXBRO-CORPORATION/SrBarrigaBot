import {Command} from "../command.js";
import {Entry} from "../../domain/entry.js";

export abstract class ListEntriesPort extends Command<Promise<Entry[]>> {
}
