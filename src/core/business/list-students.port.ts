import {Command} from "../command.js";
import {StudentSummary} from "../../domain/student-summary.js";

export abstract class ListStudentsPort extends Command<Promise<StudentSummary[]>> {
}
