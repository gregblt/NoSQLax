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
// AJV schema for CouchDB document validation
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
2. Define the repository by extending CouchRepository. CouchRepository requires a nano connection, AJV options and the entity linked to this repository. By default CouchRepository provides basic CRUD operations based on document IDs and Mongo query selectors. But you can extend it to add your own methods to get data from CouchDB. For instance by querying views. You can access the nano connection and its methods using this.dbConnection. 
```
const { CouchRepository } = require('nosqlax');  // Your library
const User = require('../entities/User');  // Import the User entity
const dbConnection = require('../db/dbConnection');  // Import DB connection

class UserRepository extends CouchRepository {

  constructor(connection, options = {}) {
    super(connection, options, User);
  }

  // Add custom repository methods here, if needed

  async findByName(name) {
    return this.findOne({ name: { $eq: name } });
  }

  async getViewA(options) {
    return this.dbConnection.view('design', 'view', options)
    // you can also process view results here to return User entities
  }
}

module.exports = UserRepository;
```
3. Build you business logic using the repository. For instance a UserService class. 
```
const UserRepository = require('../repositories/UserRepository');

class UserService {
  constructor(userRepository) {
    this.repository = userRepository  // Use the dedicated UserRepository. 
  }

  async createUser(user) {
    try {
      // Create a new user
      const user = await this.repository.create(user);
      console.log('Created user:', user);
      return user;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  async findUserById(id) {
    try {
      const user = await this.repository.find(id);
      console.log('Found user:', user);
      return user;
    } catch (err) {
      console.error('Error finding user:', err);
      throw err;
    }
  }

  async findUserByName(name) {
    try {
      const user = await this.repository.findByName(name)
      console.log('Found user by name:', user);
      return user;
    } catch (err) {
      console.error('Error finding user by name:', err);
      throw err;
    }
  }
}

module.exports = UserService;
```
4. Relax and have fun! When instanciating the repository, you can pass the schema in case you defined your entity schema as a schema ID instead of the schema itself.
```
const UserRepository = require('../repositories/UserRepository');
const UserService = require('./services/UserService');
const User = require('../entities/User');  // Import the User entity

async function run() {
  const userRepository = new UserRepository(nanoConnection, {
        schemas: [userSchema],
        allErrors: true
      });
  const userService = new UserService(userRepository);

  // Example: Creating a new user
  const newUser = new User({
    name: 'Jane Doe',
    contactEmail: 'jane.doe@example.com',
  });

  await userService.createUser(newUser);

  // Example: Searching for the user by ID
  const userId = 'some-user-id';  // Replace with a valid ID
  await userService.findUserById(userId);

  // Example: Searching for the user by name
  await userService.findUserByName('Jane Doe');
}

run().catch((err) => console.error(err));
```
