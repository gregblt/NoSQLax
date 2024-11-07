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
const transformToDocumentFormat = function (data, entityClass) {
    const transformedData = {};
    const fieldMap = entityClass.fieldMap || {};
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
    const typeField = CouchRepository.getFieldNameFromFieldMap(entityClass, 'type');
    transformedData[typeField] = entityClass.type;
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
const findUsingMango = function (query, entityClass, connection) {
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
            query.selector[CouchRepository.getFieldNameFromFieldMap(entityClass, 'type')] = entityClass.type;
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
            throw new Error(`${entityClass.name} must extend BaseEntity`);
        }
        this.connection = nanoConnection;
        this.entityClass = entityClass;
        this.validator = new Validation_1.default(ajvOptions, this.entityClass.schemaOrSchemaId);
    }
    // 1. Find a document by its ID
    find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    throw new Error("ID must be provided");
                }
                const res = yield findUsingMango({ selector: { _id: id } }, this.entityClass, this.connection);
                if (res.docs.length === 0) {
                    return null; // Document not found
                }
                return new this.entityClass(inverseTransform(res.docs[0], this.entityClass.fieldMap));
            }
            catch (err) {
                throw err;
            }
        });
    }
    // 1. Find a document by its ID
    findOrFail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    throw new Error("ID must be provided");
                }
                const res = yield findUsingMango({ selector: { _id: id } }, this.entityClass, this.connection);
                if (res.docs.length === 0) {
                    throw new Error("Document not found");
                }
                const transformed = inverseTransform(res.docs[0], this.entityClass.fieldMap);
                console.log(transformed);
                return new this.entityClass(transformed);
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
                const res = yield findUsingMango({ selector }, this.entityClass, this.connection);
                if (res.docs.length === 0) {
                    return null; // No document found
                }
                return new this.entityClass(inverseTransform(res.docs[0], this.entityClass.fieldMap));
            }
            catch (err) {
                throw err;
            }
        });
    }
    // 3. Find one document or fail
    findOneOrFail(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield findUsingMango({ selector }, this.entityClass, this.connection);
                if (res.docs.length === 0) {
                    throw new Error("Document not found");
                }
                return new this.entityClass(inverseTransform(res.docs[0], this.entityClass.fieldMap));
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
                const res = yield findUsingMango({ selector }, this.entityClass, this.connection);
                return res.docs.map((doc) => new this.entityClass(doc));
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
                const res = yield findUsingMango({ selector: {} }, this.entityClass, this.connection);
                return res.docs.map((doc) => new this.entityClass(doc));
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
                const transformedData = transformToDocumentFormat(data, this.entityClass);
                console.log(transformedData); // For debugging the transformed data
                // Insert the document into the database
                const response = yield this.connection.insert(transformedData);
                // Return the newly created entity
                return this.findOrFail(response.id);
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
                const updatedDoc = Object.assign(Object.assign(Object.assign({}, existingDoc), data), { [CouchRepository.getFieldNameFromFieldMap(this.entityClass, 'type')]: this.entityClass.type, _id: id, _rev: existingDoc.rev });
                this.validator.validate(updatedDoc);
                const response = yield this.connection.insert(updatedDoc);
                return new this.entityClass(Object.assign(Object.assign({}, updatedDoc), { _rev: response.rev }));
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
    // 9. Use a view to fetch data
    static view(connection_1, designname_1, viewname_1, _a) {
        return __awaiter(this, arguments, void 0, function* (connection, designname, viewname, [params]) {
            try {
                return yield connection.view(designname, viewname, params);
            }
            catch (err) {
                throw err;
            }
        });
    }
    static getFieldNameFromFieldMap(entityClass, entityAttr) {
        // Check if fieldMap exists and contains the given entity attribute
        const fieldMap = entityClass.fieldMap || {};
        // If a custom mapping exists in the fieldMap, return it
        if (fieldMap[entityAttr]) {
            return fieldMap[entityAttr];
        }
        // If no custom mapping, return the entity attribute name as the field name
        return entityAttr;
    }
}
exports.default = CouchRepository;
