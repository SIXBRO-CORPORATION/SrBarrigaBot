import {Command} from "../command.js";
import {Student} from "../../domain/student.js";

export abstract class CreateStudentPort extends Command<Promise<Student>> {
}
