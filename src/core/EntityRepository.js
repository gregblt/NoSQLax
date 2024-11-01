const db = require("../config/database");

class EntityRepository {
  constructor(entityClass) {
    this.entityClass = entityClass;
  }

  async create(entity) {
    const document = new this.entityClass(entity).toJSON();
    document.type = this.entityClass.prototype.documentType;
    const response = await db.insert(document);
    entity.setId(response.id);
    return { ...document, _id: response.id, _rev: response.rev };
  }

  async findById(id) {
    try {
      const document = await db.get(id);
      const entity = new this.entityClass(document);
      entity.setId(id);
      return entity;
    } catch (error) {
      if (error.statusCode === 404) return null;
      throw error;
    }
  }

  async update(id, entity) {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Document with id ${id} not found`);

    const updatedDocument = { ...existing.toJSON(), ...entity, _id: id, _rev: existing._rev };
    const response = await db.insert(updatedDocument);
    entity.setId(response.id);
    return { ...updatedDocument, _rev: response.rev };
  }

  async delete(id) {
    const entity = await this.findById(id);
    if (!entity) throw new Error(`Document with id ${id} not found`);
    return db.destroy(id, entity._rev);
  }
}

module.exports = EntityRepository;
