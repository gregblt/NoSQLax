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
class CouchRepository {
    constructor(nanoConnection, ajvOptions, entityClass) {
        // Check if entityClass extends BaseEntity
        if (!(entityClass.prototype instanceof BaseEntity_1.default)) {
            throw new Error(`${entityClass.name} must extend BaseEntity`);
        }
        this.connection = nanoConnection;
        this.entityClass = entityClass;
        this.validator = new Validation_1.default(ajvOptions, this.entityClass.schemaOrSchemaId);
        // Return a Proxy to dynamically handle method calls, for instance readByName("alice") will generate a mango query to get 
        // Document with this docType and name property "Alice"
        return new Proxy(this, {
            get: (target, prop) => {
                // Check if the property is a method name starting with "findBy"
                if (typeof prop === "string" && prop.startsWith("findBy")) {
                    return (...args) => __awaiter(this, void 0, void 0, function* () {
                        // Extract the field names from the method name, e.g., "findByEmailName" -> ["Email", "Name"]
                        const fieldNames = prop.slice(6).match(/[A-Z][a-z]+/g); // Split camelCase into an array
                        if (!fieldNames || fieldNames.length === 0) {
                            throw new Error("Invalid method name");
                        }
                        // Convert the field names to lowercase and map them to the arguments
                        const query = { selector: { docType: target.entityClass.docType } };
                        fieldNames.forEach((fieldName, index) => {
                            const queryField = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
                            query.selector[queryField] = args[index];
                        });
                        console.log(query);
                        try {
                            const res = yield target.connection.find(query);
                            if (res.docs.length === 0) {
                                return null; // Return null if no documents are found
                            }
                            // Map the results to instances of the entity class
                            //return res.docs.map((doc) => new target.entityClass(doc));
                            return new target.entityClass(res.docs[0]);
                        }
                        catch (error) {
                            throw error;
                        }
                    });
                }
                // If the method is not "findBy...", return the original property
                return target[prop];
            },
        });
    }
    // Existing methods (create, read, update, delete) remain unchanged
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const document = Object.assign(Object.assign({}, data), { docType: this.entityClass.docType });
                this.validator.validate(document);
                const response = yield this.connection.insert(document);
                return new this.entityClass(Object.assign(Object.assign({}, document), { _id: response.id }));
            }
            catch (err) {
                throw err;
            }
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    throw new Error('id must be provided');
                }
                const res = yield this.find({
                    selector: { _id: id, docType: this.entityClass.docType },
                });
                if (res.docs.length === 0) {
                    throw new Error('Document not found');
                }
                return new this.entityClass(res.docs[0]);
            }
            catch (err) {
                throw err;
            }
        });
    }
    readAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Use the connection to find all documents with the specific docType
                const res = yield this.find({
                    selector: { docType: this.entityClass.docType }, // Select all documents with the specified docType
                });
                // If no documents are found, return an empty array
                if (res.docs.length === 0) {
                    return [];
                }
                // Map each document to an instance of the specified entity class
                return res.docs.map((doc) => new this.entityClass(doc));
            }
            catch (err) {
                throw err;
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingDoc = yield this.read(id);
                const updatedDoc = Object.assign(Object.assign(Object.assign({}, existingDoc), data), { docType: this.entityClass.docType, _id: id, _rev: existingDoc.rev });
                this.validator.validate(updatedDoc);
                const response = yield this.connection.insert(updatedDoc);
                return new this.entityClass(Object.assign(Object.assign({}, updatedDoc), { _rev: response.rev }));
            }
            catch (err) {
                throw err;
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingDoc = yield this.read(id);
                yield this.connection.destroy(id, existingDoc.rev);
                return { message: 'Document deleted successfully' };
            }
            catch (err) {
                throw err;
            }
        });
    }
    view(designname_1, viewname_1, _a) {
        return __awaiter(this, arguments, void 0, function* (designname, viewname, [params]) {
            try {
                return yield this.connection.view(designname, viewname, params);
            }
            catch (err) {
                throw err;
            }
        });
    }
    find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.connection.find(query);
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = CouchRepository;
