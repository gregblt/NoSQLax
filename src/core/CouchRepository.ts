import Nano, { DocumentScope } from "nano";
import Validation from './Validation'; // Import the Validation class
import BaseEntity from './BaseEntity';

// Type for the entity class constructor
type EntityClass = {
  new(data: Record<string, any>): BaseEntity;
  schemaOrSchemaId: string | object;
  docType: string;
};

abstract class CouchRepository {
  private connection: DocumentScope<Nano.MaybeDocument>; // Type from nano library
  private validator: Validation;
  private entityClass: EntityClass;

  constructor(nanoConnection: DocumentScope<Nano.MaybeDocument>, ajvOptions: any, entityClass: EntityClass) {
    this.connection = nanoConnection; // Store the custom CouchDB connection
    this.entityClass = entityClass;
    this.validator = new Validation(
      ajvOptions,
      this.entityClass.schemaOrSchemaId
    )
  }

  /*   protected mapToEntity(doc: any): T {
      const entity = new this.entityConstructor();
      // Map _id to id and _rev to rev
      const mapped = {
        ...doc,
        id: doc._id,
        rev: doc._rev
      };
      delete mapped._id;
      delete mapped._rev;
      
      Object.assign(entity, mapped);
      return entity;
    } */

  async create(data: BaseEntity): Promise<BaseEntity> {
    try {
      const document = { ...data, docType: this.entityClass.docType } as Object; // Add docType to the document
      this.validator.validate(document); // Validate the data using the Validation class
      const response = await this.connection.insert(document); // Insert the document using nano
      return new this.entityClass({ ...document, _id: response.id });
    } catch (err) {
      throw err;
    }
  }

  async read(id: string): Promise<BaseEntity> {
    try {
      if (!id) {
        throw new Error('id must be provided');
      }

      // Use the connection to find the document by id and type
      const res = await this.connection.find({
        selector: { _id: id, docType: this.entityClass.docType }, // MongoDB-like query
      });
      if (res.docs.length === 0) {
        throw new Error('Document not found');
      }

      // Create an instance of the specified entity class
      return new this.entityClass(res.docs[0]);

    } catch (err) {
      throw err;
    }
  }

  async update(id: string, data: any): Promise<BaseEntity> {
    try {
      const existingDoc = await this.read(id); // Fetch existing document
      const updatedDoc = {
        ...existingDoc,
        ...data,
        docType: this.entityClass.docType,
        _id: id,
        _rev: existingDoc.rev,
      }; // Merge updates
      this.validator.validate(updatedDoc); // Validate incoming data
      const response = await this.connection.insert(updatedDoc); // Use the connection to insert the updated document
      return new this.entityClass({ ...updatedDoc, _rev: response.rev });
    } catch (err) {
      throw err;
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const existingDoc = await this.read(id); // Fetch document to delete
      await this.connection.destroy(id, existingDoc.rev as string); // Use the connection to destroy the document
      return { message: 'Document deleted successfully' };
    } catch (err) {
      throw err;
    }
  }
}

export default CouchRepository;
