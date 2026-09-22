import {Command} from "../command.js";
import {Payment} from "../../domain/payment.js";

export abstract class RegisterPaymentPort extends Command<Promise<Payment>> {
}
