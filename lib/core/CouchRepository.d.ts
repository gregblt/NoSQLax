import Nano, { DocumentScope } from "nano";
import BaseEntity from './BaseEntity';
type EntityClass = {
    fieldMap: Record<string, string>;
    new (data: Record<string, any>): BaseEntity;
    schemaOrSchemaId: string | object;
    type: string;
    [key: string]: any;
};
declare abstract class CouchRepository {
    private connection;
    private validator;
    private entityClass;
    private fieldMap;
    constructor(nanoConnection: DocumentScope<Nano.MaybeDocument>, ajvOptions: any, entityClass: EntityClass);
    find(id: string): Promise<BaseEntity>;
    findOne(selector: any): Promise<BaseEntity>;
    findMany(selector: any): Promise<BaseEntity[]>;
    findAll(): Promise<BaseEntity[]>;
    create(data: EntityClass): Promise<BaseEntity>;
    update(id: string, data: EntityClass): Promise<BaseEntity>;
    delete(id: string): Promise<{
        message: string;
    }>;
    get dbConnection(): Nano.DocumentScope<Nano.MaybeDocument>;
    static getFieldNameFromFieldMap(fieldMap: Record<string, string>, entityAttr: string): string;
}
export default CouchRepository;
