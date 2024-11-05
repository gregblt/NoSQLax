import { Options, ValidateFunction } from 'ajv';
declare class Validation {
    private ajv;
    validate: ValidateFunction;
    constructor(ajvOptions: Options, schemaOrSchemaId: object | string);
    validateData(data: any): void;
}
export default Validation;
