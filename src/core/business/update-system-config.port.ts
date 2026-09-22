import {Command} from "../command.js";
import {SystemConfig} from "../../domain/system-config.js";

export abstract class UpdateSystemConfigPort extends Command<Promise<SystemConfig>> {
}
