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
    // Check if entityClass extends BaseEntity
    if (!(entityClass.prototype instanceof BaseEntity)) {
      throw new Error(`${entityClass.name} must extend BaseEntity`);
    }

    this.connection = nanoConnection;
    this.entityClass = entityClass;
    this.validator = new Validation(ajvOptions, this.entityClass.schemaOrSchemaId);

    // Return a Proxy to dynamically handle method calls, for instance readByName("alice") will generate a mango query to get 
    // Document with this docType and name property "Alice"
    return new Proxy(this, {
      get: (target, prop) => {
        // Check if the property is a method name starting with "findBy"
        if (typeof prop === "string" && prop.startsWith("findBy")) {
          return async (...args: any[]) => {
            // Extract the field names from the method name, e.g., "findByEmailName" -> ["Email", "Name"]
            const fieldNames = prop.slice(6).match(/[A-Z][a-z]+/g); // Split camelCase into an array
    
            if (!fieldNames || fieldNames.length === 0) {
              throw new Error("Invalid method name");
            }
    
            // Convert the field names to lowercase and map them to the arguments
            const query = { selector: { docType: target.entityClass.docType } } as any;
            fieldNames.forEach((fieldName, index) => {
              const queryField = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
              query.selector[queryField] = args[index];
            });
    
            console.log(query);
    
            try {
              const res = await target.connection.find(query);
              if (res.docs.length === 0) {
                return null; // Return null if no documents are found
              }
    
              // Map the results to instances of the entity class
              //return res.docs.map((doc) => new target.entityClass(doc));
              return new target.entityClass(res.docs[0]);
            } catch (error) {
              throw error;
            }
          };
        }
        // If the method is not "findBy...", return the original property
        return (target as any)[prop];
      },
    });
    
  }

  // Existing methods (create, read, update, delete) remain unchanged

  async create(data: BaseEntity): Promise<BaseEntity> {
    try {
      const document = { ...data, docType: this.entityClass.docType } as Object;
      this.validator.validate(document);
      const response = await this.connection.insert(document);
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

      const res = await this.find(
        {
          selector: { _id: id, docType: this.entityClass.docType },
        }
      );

      if (res.docs.length === 0) {
        throw new Error('Document not found');
      }

      return new this.entityClass(res.docs[0]);
    } catch (err) {
      throw err;
    }
  }

  async readAll(): Promise<BaseEntity[]> {
    try {
      // Use the connection to find all documents with the specific docType
      const res = await this.find({
        selector: { docType: this.entityClass.docType }, // Select all documents with the specified docType
      });

      // If no documents are found, return an empty array
      if (res.docs.length === 0) {
        return [];
      }

      // Map each document to an instance of the specified entity class
      return res.docs.map((doc) => new this.entityClass(doc));
    } catch (err) {
      throw err;
    }
  }

  async update(id: string, data: BaseEntity): Promise<BaseEntity> {
    try {
      const existingDoc = await this.read(id);
      const updatedDoc = {
        ...existingDoc,
        ...data,
        docType: this.entityClass.docType,
        _id: id,
        _rev: existingDoc.rev,
      };
      this.validator.validate(updatedDoc);
      const response = await this.connection.insert(updatedDoc);
      return new this.entityClass({ ...updatedDoc, _rev: response.rev });
    } catch (err) {
      throw err;
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const existingDoc = await this.read(id);
      await this.connection.destroy(id, existingDoc.rev as string);
      return { message: 'Document deleted successfully' };
    } catch (err) {
      throw err;
    }
  }

  async view(designname: string, viewname: string, [params]: [any]): Promise<Nano.DocumentViewResponse<unknown, Nano.MaybeDocument>> {
    try {
      return await this.connection.view(designname, viewname, params);
    }
    catch (err) {
      throw err;
    }
  }

  async find(query: Nano.MangoQuery): Promise<Nano.MangoResponse<Nano.MaybeDocument>> {
    try {
      return await this.connection.find(query);
    }
    catch (err) {
      throw err;
    }
  }

}

export default CouchRepository;
