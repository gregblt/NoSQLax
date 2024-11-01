// src/Validation.js
const Ajv = require('ajv');

class Validation {
  constructor(schema) {
    // Enable all errors and verbose error reporting
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    this.validate = this.ajv.compile(schema); // Compile the schema
  }

  validateData(data) {
    const valid = this.validate(data); // Validate the data
    if (!valid) {
      // Construct a raw error message with all validation issues
      const errorDetails = this.validate.errors.map(err => {
        return JSON.stringify(err).replace(/\"/g, '');;
      }).join(', ');

      // Throw an error with the raw details from AJV
      throw new Error(`Validation failed: ${errorDetails}`);
    }
  }
}

module.exports = Validation;
