// src/CouchRepository.js
const Validation = require('./Validation'); // Import the Validation class

class CouchRepository {
  constructor(nanoConnection, entityClass) {
    this.connection = nanoConnection; // Store the custom CouchDB connection
    this.schema = entityClass.validationSchema; // Store the schema
    this.entityClass = entityClass; // Store the entity class
    this.validator = new Validation(entityClass.validationSchema); // Initialize validation with the schema
  }

  async create(data) {
    try {
      const document = { ...data.getObject(), docType: this.entityClass.docType }; // Add doctype to the document
      this.validator.validateData(document); // Validate the data using the Validation class
      const response = await this.connection.insert(document); // Insert the document
      return new this.entityClass({ ...document, _id: response.id }); // Return instance of the entity class with assigned ID
    }
    catch(err) {
      throw err;
    }

  }

  async read(id) {
    try {
      if (!id) {
        throw new Error('id must be provided');
      }
  
      // Use the connection to find the document by id and type
      const res = await this.connection.find({ "selector": { _id: id, docType: this.entityClass.docType } }); // MongoDB-like query
      if (res.docs.length === 0) {
        throw new Error('Document not found');
      }
  
      // Create an instance of the specified entity class
      return new this.entityClass(res.docs[0]); // Return instance of the entity class
    }
    catch(err) {
      throw err;
    }

  }

  async update(id, data) {
    try {
      const existingDoc = await this.read( id ); // Fetch existing document
      const updatedDoc = { ...existingDoc, ...data, docType: this.entityClass.docType, _id: id, _rev: existingDoc.rev }; // Merge updates
      this.validator.validateData(updatedDoc); // Validate incoming data
      const response = await this.connection.insert(updatedDoc); // Use the connection to insert the updated document
      return new this.entityClass({...updatedDoc, _rev: response.rev}); // Return updated document as entity instance
    }
    catch(err) {
      throw err;
    }

  }

  async delete(id) {
    try {
      const existingDoc = await this.read( id ); // Fetch document to delete
      await this.connection.destroy(id, existingDoc.rev); // Use the connection to destroy the document
      return { message: 'Document deleted successfully' };
    }
    catch(err) {
      throw err;
    }

  }
}

module.exports = CouchRepository;
