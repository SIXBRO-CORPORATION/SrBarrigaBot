import {Command} from "../command.js";
import {User} from "../../domain/user.js";

export abstract class GetUserPort extends Command<Promise<User>> {
}