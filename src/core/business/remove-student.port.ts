import {Command} from "../command.js";
import {Student} from "../../domain/student.js";

export abstract class RemoveStudentPort extends Command<Promise<Student>> {
}
