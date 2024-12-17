const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { initTestDb, closeTestDb } = require('../setup/testDb');
const categoryRouter = require('../../routes/categories');
const Category = require('../../models/category');

const app = express();
app.use(bodyParser.json());
app.use('/api/categories', categoryRouter);

describe('Category Routes', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Category.destroy({ where: {} });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'Laptops'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('name', 'Laptops');
      expect(response.body).toHaveProperty('id');
      expect(response.status).toBe(201); 
    });

    it('should return error', async () => {
      

      const response = await request(app)
        .post('/api/categories')
        .expect(400);
      expect(response.body).toHaveProperty('error', 'notNull Violation: Category.name cannot be null');
      expect(response.status).toBe(400); 
    });
  });


  describe('GET /api/categories', () => {
     beforeEach(async () => {
      await Category.bulkCreate([
         { name: 'Electro' }
         
       ]);
     });

   // it('should return all categories', async () => {});
 // });
 
 it('should return all categories', async () => {
      

  const response = await request(app)
    .get('/api/categories')
    expect(response.status).toBe(200); // Verifica que la respuesta sea 200
      expect(response.body.length).toBe(1); // Verifica que se obtienen dos productos
});
});
});