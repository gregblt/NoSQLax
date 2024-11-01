// src/BaseEntity.js
class BaseEntity {

  #_id;
  #docType;
  #_rev;

  constructor(data = {}) {
    this._id = data._id || undefined; // Initialize ID; optional for new entities
    this._rev = data._rev || undefined; // Initialize ID; optional for new entities
    this.docType = data.docType;
  }

  get uuid () {
    return this._id
  }
  get rev () {
    return this._rev
  }
}

module.exports = BaseEntity;
