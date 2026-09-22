import {Command} from "../command.js";
import {Student} from "../../domain/student.js";

export abstract class UpdateStudentPort extends Command<Promise<Student>> {
}
