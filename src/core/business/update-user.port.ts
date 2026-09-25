import {Command} from "../command.js";
import {User} from "../../domain/user.js";

export abstract class UpdateUserPort extends Command<Promise<User>> {
}