const Ajv = require("ajv");
const ajv = new Ajv();

function validateSchema(schema) {
  return (data) => {
    const validate = ajv.compile(schema);
    if (!validate(data)) {
      throw new Error(`Validation failed: ${ajv.errorsText(validate.errors)}`);
    }
  };
}

module.exports = validateSchema;
