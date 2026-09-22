import {Command} from "../command.js";
import {StudentDetail} from "../../domain/student-detail.js";

export abstract class GetStudentDetailPort extends Command<Promise<StudentDetail>> {
}
