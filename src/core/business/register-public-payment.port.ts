import {Command} from "../command.js";
import {Payment} from "../../domain/payment.js";

export abstract class RegisterPublicPaymentPort extends Command<Promise<Payment>> {
}
