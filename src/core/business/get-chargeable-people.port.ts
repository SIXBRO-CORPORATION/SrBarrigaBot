import {Command} from "../command.js";
import {ChargeablePerson} from "../../domain/chargeable-person.js";

export abstract class GetChargeablePeoplePort extends Command<Promise<ChargeablePerson[]>> {
}
