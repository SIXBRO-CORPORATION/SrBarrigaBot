export class SystemConfigResponse {
    key: string;
    value: string;
    modifiedAt: Date;

    constructor(partial: Partial<SystemConfigResponse>) {
        Object.assign(this, partial);
    }
}
