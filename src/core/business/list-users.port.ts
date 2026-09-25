import {Command} from "../command.js";
import {User} from "../../domain/user.js";

export abstract class ListUsersPort extends Command<Promise<User[]>> {
}