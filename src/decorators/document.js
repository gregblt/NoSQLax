function Document({ type }) {
    return function (constructor) {
      constructor.prototype.documentType = type;
    };
  }
  
  module.exports = Document;
  