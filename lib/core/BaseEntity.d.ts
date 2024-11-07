declare abstract class BaseEntity {
    private _id?;
    private _rev?;
    static type: string;
    static schemaOrSchemaId: string | object;
    static fieldMap: Record<string, string>;
    constructor(data: {
        _id?: string;
        _rev?: string;
        [key: string]: any;
    });
    get id(): string | undefined;
    get rev(): string | undefined;
    static getFieldMap(): Record<string, string>;
}
export default BaseEntity;
