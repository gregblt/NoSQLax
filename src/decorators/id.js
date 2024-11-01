require('reflect-metadata'); // Import Reflect Metadata

const metadataKey = "idField";

function ID() {
  return function (target, key) {
    Reflect.defineMetadata(metadataKey, key, target.constructor);
  };
}

function getIdField(target) {
  return Reflect.getMetadata(metadataKey, target.constructor);
}

module.exports = { ID, getIdField };