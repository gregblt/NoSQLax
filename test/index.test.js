/**
* @jest-environment node
*/

import { jest } from '@jest/globals';
import Nano from 'nano';
import CouchRepository from '../lib/core/CouchRepository';
import BaseEntity from '../lib/core/BaseEntity';

// Mock connection to CouchDB
const mockConnection = {
  insert: jest.fn(),
  find: jest.fn(),
  destroy: jest.fn(),
};

describe('CouchRepository', () => {
  class TestEntity extends BaseEntity {
    static type = 'TestEntity';
    static schemaOrSchemaId = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    };

    static fieldMap = {
      name: 'name_field',
      age: 'age_field',
    };

    name;
    age;

    constructor(data) {
      super(data);
      this.name = data.name;
      this.age = data.age;
    }
  }

  let repository;

  beforeEach(() => {
    // Reset mock functions and create a new instance of the repository
    jest.clearAllMocks();
    repository = new CouchRepository(mockConnection, {}, TestEntity);
  });

  describe('Save (create) functionality', () => {
    it('should correctly construct a document from an entity with field mapping and save it', async () => {
      const testEntity = new TestEntity({ name: 'John Doe', age: 30 });
      mockConnection.insert.mockResolvedValue({ id: '12345', rev: '1-abc' });
      mockConnection.find.mockResolvedValue({ docs: [{ _id: '12345', _rev: '1-abc', name_field: 'John Doe', age_field: 30 }] });

      const savedEntity = await repository.create(testEntity);

      expect(mockConnection.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name_field: 'John Doe',
          age_field: 30,
          type: 'TestEntity',
        })
      );

      expect(savedEntity).toBeInstanceOf(TestEntity);
      expect(savedEntity.id).toBe('12345');
      expect(savedEntity.rev).toBe('1-abc');
      expect(savedEntity.name).toBe('John Doe');
      expect(savedEntity.age).toBe(30);
    });

    it('should throw an error if the entity is not an instance of the entity class', async () => {
      const invalidEntity = { name: 'Jane Doe', age: 25 };
      await expect(repository.create(invalidEntity)).rejects.toThrow('Data must be an instance of TestEntity');
    });
  });

  describe('Retrieve functionality', () => {
    it('should retrieve an entity by ID and correctly transform the document', async () => {
      const mockDoc = { _id: '12345', _rev: '1-abc', name_field: 'John Doe', age_field: 30 };
      mockConnection.find.mockResolvedValue({ docs: [mockDoc] });

      const retrievedEntity = await repository.find('12345');

      expect(mockConnection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: expect.objectContaining({ _id: '12345', type: 'TestEntity' }),
        })
      );

      expect(retrievedEntity).toBeInstanceOf(TestEntity);
      expect(retrievedEntity.id).toBe('12345');
      expect(retrievedEntity.rev).toBe('1-abc');
      expect(retrievedEntity.name).toBe('John Doe');
      expect(retrievedEntity.age).toBe(30);
    });

    it('should build the correct Mango query with translated fields', async () => {
      const selector = { name: { $eq: 'John Doe' }, age: { $gte: 18 } };
      const mockDoc = { _id: '12345', _rev: '1-abc', name_field: 'John Doe', age_field: 30 };
      mockConnection.find.mockResolvedValue({ docs: [mockDoc] });

      const entities = await repository.findMany(selector);

      expect(mockConnection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: {
            name_field: { $eq: 'John Doe' },
            age_field: { $gte: 18 },
            type: 'TestEntity',
          },
        })
      );

      expect(entities.length).toBe(1);
      expect(entities[0]).toBeInstanceOf(TestEntity);
      expect(entities[0].name).toBe('John Doe');
    });

    it('should throw an error if no document is found for findOrFail', async () => {
      mockConnection.find.mockResolvedValue({ docs: [] });

      await expect(repository.findOrFail('nonexistent-id')).rejects.toThrow('Document not found');
    });
  });
});
