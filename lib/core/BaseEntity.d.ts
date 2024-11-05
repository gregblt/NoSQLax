declare abstract class BaseEntity {
    private _id?;
    private _rev?;
    static docType: string;
    static schemaOrSchemaId: string | object;
    constructor(data: {
        _id?: string;
        _rev?: string;
        docType: string;
    });
    get id(): string | undefined;
    get rev(): string | undefined;
}
export default BaseEntity;
