"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Validation_1 = __importDefault(require("./Validation")); // Import the Validation class
const BaseEntity_1 = __importDefault(require("./BaseEntity"));
const DocumentNotFoundError_1 = require("./DocumentNotFoundError");
const validate = function (object, validator) {
    // remove _id and _rev as they are implicitely required
    const objectToValidate = JSON.parse(JSON.stringify(object));
    delete objectToValidate._id;
    delete objectToValidate._rev;
    validator.validateData(objectToValidate);
};
// Mango operators
const LOGICAL_OPERATORS = new Set([
    '$and', '$or', '$not', '$nor', '$all', '$elemMatch', '$allMatch', '$keyMapMatch'
]);
const CONDITIONAL_OPERATORS = new Set([
    '$lt', '$lte', '$eq', '$ne', '$gte', '$gt', '$exists', '$type', '$in', '$nin',
    '$size', '$mod', '$regex', '$beginsWith'
]);
function translateSelector(selector, fieldMap) {
    const translatedSelector = {};
    for (const [key, value] of Object.entries(selector)) {
        if (LOGICAL_OPERATORS.has(key)) {
            // Logical operator (e.g., $and): recursively translate each sub-condition
            if (Array.isArray(value)) {
                translatedSelector[key] = value.map((subSelector) => translateSelector(subSelector, fieldMap));
            }
            else {
                translatedSelector[key] = translateSelector(value, fieldMap);
            }
        }
        else if (CONDITIONAL_OPERATORS.has(key)) {
            // Conditional operator (e.g., $eq): Keep the key and value as-is, no further translation needed
            translatedSelector[key] = value;
        }
        else {
            // Regular field name, so translate it using fieldMap
            const translatedField = fieldMap[key] || key;
            // If the value is an object and not a conditional operator, translate it recursively
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const innerKeys = Object.keys(value);
                const isConditional = innerKeys.every(k => CONDITIONAL_OPERATORS.has(k));
                // If all inner keys are conditional, translate the field name and keep conditions as-is
                if (isConditional) {
                    translatedSelector[translatedField] = value;
                }
                else {
                    // Otherwise, translate recursively
                    translatedSelector[translatedField] = translateSelector(value, fieldMap);
                }
            }
            else {
                // Primitive or array value, assign directly
                translatedSelector[translatedField] = value;
            }
        }
    }
    return translatedSelector;
}
const transformToDocumentFormat = function (data, entityClass, fieldMap) {
    const transformedData = {};
    data.type = entityClass.type; // add type
    // Map attributes to the document fields according to fieldMap
    for (const [attribute, field] of Object.entries(fieldMap)) {
        if (data.hasOwnProperty(attribute)) {
            // Handle dot notation for nested fields
            const fieldParts = field.split('.');
            // Create nested objects if necessary
            let current = transformedData;
            for (let i = 0; i < fieldParts.length - 1; i++) {
                if (!current[fieldParts[i]]) {
                    current[fieldParts[i]] = {}; // Create a nested object if it doesn't exist
                }
                current = current[fieldParts[i]]; // Move down to the next level
            }
            // Set the value at the final part of the dot notation
            current[fieldParts[fieldParts.length - 1]] = data[attribute];
        }
    }
    // Add unmapped attributes directly to the transformed data
    for (const [attribute, value] of Object.entries(data)) {
        if (!fieldMap[attribute]) {
            transformedData[attribute] = value;
        }
    }
    return transformedData;
};
// utils
const inverseTransform = function (document, fieldMap) {
    const originalData = {};
    // Iterate over the field map to map fields back to attributes
    for (const [attribute, fieldPath] of Object.entries(fieldMap)) {
        const fieldParts = fieldPath.split('.'); // Split the field path by dot notation
        // Navigate through the document to get the value of the nested field
        let value = document;
        for (const part of fieldParts) {
            if (value && value.hasOwnProperty(part)) {
                value = value[part];
            }
            else {
                value = undefined;
                break;
            }
        }
        // If a valid value is found, assign it to the originalData using the attribute name
        if (value !== undefined) {
            originalData[attribute] = value;
        }
    }
    // Add any unmapped fields directly to the original data
    for (const [field, value] of Object.entries(document)) {
        if (!Object.values(fieldMap).some(mappedField => field.startsWith(mappedField.split('.')[0]))) {
            originalData[field] = value;
        }
    }
    return originalData;
};
const findUsingMango = function (query, entityClass, connection, fieldMap) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ensure this method is used only from CouchRepository
            /*       if (this.constructor !== CouchRepository) {
                    throw new Error('This method can only be used by CouchRepository, not children classes.');
                  } */
            // Add type to the selector if it's not already present
            if (!query.selector) {
                query.selector = {};
            }
            query.selector[CouchRepository.getFieldNameFromFieldMap(fieldMap, 'type')] = entityClass.type;
            // Execute the query
            return yield connection.find(query);
        }
        catch (err) {
            throw err;
        }
    });
};
class CouchRepository {
    constructor(nanoConnection, ajvOptions, entityClass) {
        // Check if entityClass extends BaseEntity
        if (!(entityClass.prototype instanceof BaseEntity_1.default)) {
            throw new Error(`entityClass must extend BaseEntity`);
        }
        this.connection = nanoConnection;
        this.entityClass = entityClass;
        this.validator = new Validation_1.default(ajvOptions, this.entityClass.schemaOrSchemaId);
        // Get the fieldMap from the entity class, but filter out _id and _rev
        const entityFieldMap = entityClass.fieldMap;
        // Create a new fieldMap by excluding _id and _rev as keys and values
        this.fieldMap = Object.entries(entityFieldMap)
            .filter(([key, value]) => key !== '_id' && key !== '_rev' && value !== '_id' && value !== '_rev')
            .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    }
    // 1. Find a document by its ID
    find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    throw new Error("ID must be provided");
                }
                const res = this.findOne({ _id: id });
                return res;
            }
            catch (err) {
                throw err;
            }
        });
    }
    // 2. Find one document using a Mango selector
    findOne(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield findUsingMango({ "selector": translateSelector(selector, this.fieldMap) }, this.entityClass, this.connection, this.fieldMap);
                if (res.docs.length === 0) {
                    throw new DocumentNotFoundError_1.DocumentNotFoundError(selector);
                }
                return new this.entityClass(inverseTransform(res.docs[0], this.fieldMap));
            }
            catch (err) {
                throw err;
            }
        });
    }
    // 4. Find many documents using a Mango selector
    findMany(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield findUsingMango({ "selector": translateSelector(selector, this.fieldMap) }, this.entityClass, this.connection, this.fieldMap);
                return res.docs.map((doc) => new this.entityClass(inverseTransform(doc, this.fieldMap)));
            }
            catch (err) {
                throw err;
            }
        });
    }
    // 5. Find all documents for the entity type
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield findUsingMango({ selector: {} }, this.entityClass, this.connection, this.fieldMap);
                return res.docs.map((doc) => new this.entityClass(inverseTransform(doc, this.fieldMap)));
            }
            catch (err) {
                throw err;
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!(data instanceof this.entityClass)) {
                    throw new Error(`Data must be an instance of ${this.entityClass.name}`);
                }
                const transformedData = transformToDocumentFormat(data, this.entityClass, this.fieldMap);
                validate(transformedData, this.validator);
                // Insert the document into the database
                const response = yield this.connection.insert(transformedData);
                // Return the newly created entity
                return this.find(response.id);
            }
            catch (err) {
                throw err;
            }
        });
    }
    // 7. Update an existing document
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingDoc = yield this.find(id);
                if (existingDoc === null) {
                    throw new Error("Document does not exists");
                }
                const updatedDoc = transformToDocumentFormat(Object.assign(Object.assign({}, existingDoc), data), this.entityClass, this.fieldMap);
                updatedDoc._id = existingDoc.id;
                updatedDoc._rev = existingDoc.rev;
                validate(updatedDoc, this.validator);
                const response = yield this.connection.insert(updatedDoc);
                // Return the newly created entity
                return this.find(response.id);
            }
            catch (err) {
                throw err;
            }
        });
    }
    // 8. Delete a document by ID
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingDoc = yield this.find(id);
                if (existingDoc === null) {
                    throw new Error("Document does not exists");
                }
                yield this.connection.destroy(id, existingDoc.rev);
                return { message: "Document deleted successfully" };
            }
            catch (err) {
                throw err;
            }
        });
    }
    // expose the connection
    get dbConnection() {
        return this.connection;
    }
    static getFieldNameFromFieldMap(fieldMap, entityAttr) {
        // If a custom mapping exists in the fieldMap, return it
        if (fieldMap[entityAttr]) {
            return fieldMap[entityAttr];
        }
        // If no custom mapping, return the entity attribute name as the field name
        return entityAttr;
    }
}
exports.default = CouchRepository;
