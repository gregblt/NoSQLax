<img src="nosqlax.png" alt="drawing" width="400"/>

# NoSQLax 💤 - A Relaxed Repository for CouchDB
NoSQLax is a modern, lightweight JavaScript library that makes working with CouchDB a breeze. Inspired by CouchDB’s “Relax” philosophy and the chill vibes of Snorlax, NoSQLax takes the hassle out of managing your data, offering a streamlined and intuitive repository pattern to handle CRUD operations effortlessly.

Whether you're validating data, extending functionality, or simplifying database interactions, NoSQLax ensures your CouchDB experience is as laid-back as its motto.

## Key Features
- Effortless CRUD Operations: Manage CouchDB documents with a consistent, simple API for create, read, update, and delete. No boilerplate — just relax and code.
- Seamless Schema Validation: Built-in JSON schema validation using AJV ensures your data is clean and reliable, either inline or through shared schema references.
- Extensible by Design: Tailor repositories to your needs by easily adding custom methods and extending base functionality.
- Entity-Centric Design: Map CouchDB documents to entities with support for data transformation and schema alignment.
- Developer-Focused Simplicity: Minimize cognitive load with clear, predictable methods and patterns, so you can focus on building features, not debugging database interactions.
- Flexible CouchDB Support: Works seamlessly with CouchDB’s schema-less nature while enabling structured and validated data models.

## Why Choose NoSQLax?
NoSQLax bridges the gap between CouchDB’s flexibility and the structure developers need. Whether you're building a lightweight application or scaling a robust API, NoSQLax gives you the tools to manage your data reliably without sacrificing simplicity or performance.
Take a deep breath, relax, and let NoSQLax handle the heavy lifting for your CouchDB operations.

## Installation
```npm install nosqlax```

## Getting started
1. Define your entity by extanding the BaseEntity. Specify it's type, the schema and the mapping between the entity properties and the CouchDB document. The schema can either be represented by and AJV object or the schema ID (we will see later how to pass ajv options with your schema corresponding to this ID to the repository.
```
const { BaseEntity } = require('nosqlax');  // Your library
// AJV schema for User validation
const userSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    contact: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
    },
  },
  required: ['email', 'name'],
};
class User extends BaseEntity {
  static type = 'user';  
  static schemaOrSchemaId = userSchema; 
  static fieldMap = {
    email: 'email',  // Entity's email field is mapped to 'email' in the document
    name: 'name'
    type: 'docType', // The type (here 'user', is specified by the docType property in the couchdb document
    contactEmail: 'contact.email',  // Entity's contactEmail field is mapped to 'contact.email' in the document
  };

  constructor(data) {
    super(data);
    this.email = data.email;
    this.name = data.name;
    this.contactEmail = data.contactEmail;
  }
}

module.exports = User;
```
