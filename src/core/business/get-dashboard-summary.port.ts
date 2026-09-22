import {Command} from "../command.js";
import {DashboardSummary} from "../../domain/dashboard-summary.js";

export abstract class GetDashboardSummaryPort extends Command<Promise<DashboardSummary>> {
}
