// src/BaseEntity.ts

abstract class BaseEntity {
  // Using private properties with TypeScript
  private _id?: string; // The `?` indicates that the property is optional
  private _rev?: string;

  static docType: string;
  static schemaOrSchemaId: string | object;

  // Constructor with an optional data object
  constructor(data: { _id?: string; _rev?: string; docType: string } ) {
    this._id = data._id; // Initialize _id, can be undefined
    this._rev = data._rev; // Initialize _rev, can be undefined
    if ((this.constructor as typeof BaseEntity).schemaOrSchemaId === undefined) {
      throw new Error(`${this.constructor.name} must define docType`);
    }
    if ((this.constructor as typeof BaseEntity).docType === undefined) {
      throw new Error(`${this.constructor.name} must define schemaOrSchemaId:`);
    }
  }

  // Getter for uuid
  get id(): string | undefined {
    return this._id;
  }

  // Getter for rev
  get rev(): string | undefined {
    return this._rev;
  }
}

// Export the class as default
export default BaseEntity;
