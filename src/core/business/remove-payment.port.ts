import {Command} from "../command.js";
import {Payment} from "../../domain/payment.js";

export abstract class RemovePaymentPort extends Command<Promise<Payment>> {
}
