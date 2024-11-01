function Field() {
    return function (target, key) {
      if (!target.constructor.fields) {
        target.constructor.fields = [];
      }
      target.constructor.fields.push(key);
    };
  }
  
  module.exports = Field;