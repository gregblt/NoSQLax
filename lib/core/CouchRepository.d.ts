import Nano, { DocumentScope } from "nano";
import BaseEntity from './BaseEntity';
type EntityClass = {
    new (data: Record<string, any>): BaseEntity;
    schemaOrSchemaId: string | object;
    docType: string;
};
declare abstract class CouchRepository {
    private connection;
    private validator;
    private entityClass;
    constructor(nanoConnection: DocumentScope<Nano.MaybeDocument>, ajvOptions: any, entityClass: EntityClass);
    create(data: BaseEntity): Promise<BaseEntity>;
    read(id: string): Promise<BaseEntity>;
    readAll(): Promise<BaseEntity[]>;
    update(id: string, data: BaseEntity): Promise<BaseEntity>;
    delete(id: string): Promise<{
        message: string;
    }>;
    view(designname: string, viewname: string, [params]: [any]): Promise<Nano.DocumentViewResponse<unknown, Nano.MaybeDocument>>;
    find(query: Nano.MangoQuery): Promise<Nano.MangoResponse<Nano.MaybeDocument>>;
}
export default CouchRepository;
