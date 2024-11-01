const { getIdField } = require("../decorators/id");

class BaseEntity {
  constructor(data = {}) {
    
    Object.assign(this, data);
    console.log(data)
    console.log(this)
    return new Proxy(this, {
      get: (target, prop) => target[prop],
      set: (target, prop, value) => {
        target[prop] = value;
        return true;
      },
    });
  }

  toJSON() {
    const json = { ...this };
    const idField = getIdField(this);
    if (idField) {
      json._id = this[idField];
    }
    return json;
  }

  setId(id) {
    const idField = getIdField(this);
    if (idField) {
      this[idField] = id;
    }
  }
}

module.exports = BaseEntity;
