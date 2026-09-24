import {Command} from "../command.js";
import {PixInfo} from "../../domain/pix-info.js";

export abstract class GetPixInfoPort extends Command<Promise<PixInfo>> {
}
