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
    constructor(nanoConnection: DocumentScope<Nano.MaybeDocument>, ajvOptions: any, entityClass: EntityClass);
    find(id: string): Promise<BaseEntity | null>;
    findOrFail(id: string): Promise<BaseEntity>;
    findOne(selector: any): Promise<BaseEntity | null>;
    findOneOrFail(selector: any): Promise<BaseEntity>;
    findMany(selector: any): Promise<BaseEntity[]>;
    findAll(): Promise<BaseEntity[]>;
    create(data: EntityClass): Promise<BaseEntity>;
    update(id: string, data: EntityClass): Promise<BaseEntity>;
    delete(id: string): Promise<{
        message: string;
    }>;
    static view(connection: DocumentScope<Nano.MaybeDocument>, designname: string, viewname: string, [params]: [any]): Promise<Nano.DocumentViewResponse<unknown, Nano.MaybeDocument>>;
    static getFieldNameFromFieldMap(entityClass: EntityClass, entityAttr: string): string;
}
export default CouchRepository;
