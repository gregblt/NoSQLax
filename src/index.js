// src/index.js

// Importing core components
const BaseEntity = require('./core/BaseEntity');
const EntityRepository = require('./core/EntityRepository');
const Document = require('./decorators/document');
const Field = require('./decorators/field');
const { ID, getIdField } = require('./decorators/id');
const validateSchema = require('./core/validation');

// Exporting the components for external use
module.exports = {
  BaseEntity,
  EntityRepository,
  Document,
  Field,
  ID,
  getIdField,
  validateSchema,
};