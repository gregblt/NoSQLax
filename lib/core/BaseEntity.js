"use strict";
// src/BaseEntity.ts
Object.defineProperty(exports, "__esModule", { value: true });
class BaseEntity {
    // Constructor with an optional data object
    constructor(data) {
        this._id = data._id; // Initialize _id, can be undefined
        this._rev = data._rev; // Initialize _rev, can be undefined
        if (this.constructor.schemaOrSchemaId === undefined) {
            throw new Error(`${this.constructor.name} must define docType`);
        }
        if (this.constructor.docType === undefined) {
            throw new Error(`${this.constructor.name} must define schemaOrSchemaId:`);
        }
    }
    // Getter for uuid
    get id() {
        return this._id;
    }
    // Getter for rev
    get rev() {
        return this._rev;
    }
}
// Export the class as default
exports.default = BaseEntity;
