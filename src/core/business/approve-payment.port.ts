import {Command} from "../command.js";
import {Payment} from "../../domain/payment.js";

export abstract class ApprovePaymentPort extends Command<Promise<Payment>> {
}
