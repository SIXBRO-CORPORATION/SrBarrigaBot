export class StudentResponse {
    id: string;
    name: string;
    phone: string;
    active: boolean;
    inactivatedAt: Date | null;
    createdAt: Date;

    constructor(partial: Partial<StudentResponse>) {
        Object.assign(this, partial);
    }
}
