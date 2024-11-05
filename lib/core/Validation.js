"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv")); // Import Ajv types
class Validation {
    constructor(ajvOptions, schemaOrSchemaId) {
        // Initialize the AJV instance with options
        this.ajv = new ajv_1.default(ajvOptions);
        // Check if the schemaOrSchemaId is an object (schema) or a string (schema ID)
        if (typeof schemaOrSchemaId === 'object') {
            // Compile the schema if it's an object
            this.validate = this.ajv.compile(schemaOrSchemaId);
        }
        else if (typeof schemaOrSchemaId === 'string') {
            // Retrieve the schema if it's a string
            this.validate = this.ajv.getSchema(schemaOrSchemaId);
            // Throw an error if the schema is not found
            if (!this.validate) {
                throw new Error(`Schema with ID "${schemaOrSchemaId}" not found`);
            }
        }
        else {
            throw new Error('Invalid schema or schema ID provided');
        }
    }
    validateData(data) {
        var _a;
        const valid = this.validate(data); // Validate the data
        if (!valid) {
            // Construct an error message with all validation issues
            const errorDetails = (_a = this.validate.errors) === null || _a === void 0 ? void 0 : _a.map((err) => {
                return JSON.stringify(err).replace(/\"/g, '');
            }).join(', ');
            // Throw an error with detailed validation messages
            throw new Error(`Validation failed: ${errorDetails}`);
        }
    }
}
exports.default = Validation;
