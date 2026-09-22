import {AbstractDomain} from './abstract.domain.js';

export class Student extends AbstractDomain {
    name: string;
    matricula: string;
    phone: string;
    active: boolean;
    inactivatedAt: Date | null;
}
