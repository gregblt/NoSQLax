"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/BaseEntity.ts
class BaseEntity {
    constructor(data) {
        this._id = data._id;
        this._rev = data._rev;
        // Ensure schemaOrSchemaId is defined
        if (this.constructor.schemaOrSchemaId === undefined) {
            throw new Error(`${this.constructor.name} must define schemaOrSchemaId`);
        }
        if (this.constructor.type === undefined) {
            throw new Error(`${this.constructor.name} must define type`);
        }
    }
    // Getter for id
    get id() {
        return this._id;
    }
    // Getter for rev
    get rev() {
        return this._rev;
    }
    // Static method to get field map for the current entity
    static getFieldMap() {
        return this.fieldMap;
    }
}
// Map from entity attributes to document fields, type is implicitly handled
BaseEntity.fieldMap = { type: "type" }; // Default fieldMap, type is implicitly required
// Export the class as default
exports.default = BaseEntity;
