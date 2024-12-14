const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { initTestDb, closeTestDb } = require('../setup/testDb');
const productRouter = require('../../routes/products');
const Product = require('../../models/product');
const Category = require('../../models/category');
const ProductService = require('../../services/productService');

const app = express();
app.use(bodyParser.json());
app.use('/api/products', productRouter);

describe('Product Routes', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });


  describe('POST /api/products', () => {
    // let category;

    // beforeEach(async () => {
    //   category = await Category.create({ name: 'Test Category' });
    // });

    it('should create a new product', async () => {
      // Crear la categoría necesaria
      const category = await Category.create({ name: 'Test Category' });

      // Datos del producto
      const newProduct = { name: 'Test Product', categoryId: category.id, price: 100 };

      // Realizar la solicitud
      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      // Validaciones
      expect(response.status).toBe(201); // Verifica que la respuesta sea 201
      expect(response.body).toHaveProperty('id'); // Verifica que se crea el producto con un ID
      expect(response.body.name).toBe(newProduct.name); // Verifica el nombre del producto
    });

    it('should return error when category does not exist', async () => {
      const newProduct = { name: 'Invalid Product', categoryId: 999 }; // ID de categoría inexistente

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(400); // Verifica que se devuelve el código de error
      expect(response.body).toHaveProperty('error', 'Category with id 999 does not exist'); // Verifica el mensaje de error
    });

    it('should return all products', async () => {

      const category = await Category.create({ id: 1, name: 'Test Category' });

      await Product.create({ name: 'Product 1', categoryId: 1, price: 100 });
      await Product.create({ name: 'Product 2', categoryId: 1, price: 200 });

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200); // Verifica que la respuesta sea 200
      expect(response.body.length).toBe(2); // Verifica que se obtienen dos productos
      expect(response.body[0]).toHaveProperty('name'); // Verifica que cada producto tiene un nombre
    });


    it('should create a product on POST /', async () => {
      const category = await Category.create({ id: 1, name: 'Test Category' });
      const newProduct = { name: 'Test Product', categoryId: category.id, price: 100 };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProduct.name);
    }, 20000); // Tiempo límite de 10 segundos



    it('should return 500 if ProductService.getAllProducts throws an error', async () => {
      // Mock para forzar un error en getAllProducts
      jest.spyOn(ProductService, 'getAllProducts').mockRejectedValueOnce(new Error('Mocked error'));

      // Realizar la solicitud al endpoint
      const response = await request(app).get('/api/products');

      // Validar que el código de estado sea 500
      expect(response.status).toBe(500);
      // Validar que el cuerpo de la respuesta contenga el mensaje de error esperado
      expect(response.body).toHaveProperty('error', 'Mocked error');
    });

  });

  describe('GET /api/products/category/:categoryId', () => {


    it('should return products for category', async () => {
      const category = await Category.create({ name: 'Category A' });
      await Product.create({ name: 'Product A1', categoryId: category.id, price: 100 });
      await Product.create({ name: 'Product A2', categoryId: category.id, price: 100 });

      const response = await request(app).get(`/api/products/category/${category.id}`);

      expect(response.status).toBe(200); // Verifica que la respuesta sea 200
      expect(response.body.length).toBe(2); // Verifica que se obtienen dos productos
    }, 20000); // Aumenta el límite de tiempo a 10 segundos



    it('should return products for multiple categories', async () => {
      const category1 = await Category.create({ name: 'Category 1' });
      const category2 = await Category.create({ name: 'Category 2' });

      console.log("category1.id=" + category1.id);
      console.log("category2.id=" + category2.id);

      console.time('Product creation');
      await Product.create({ name: 'Product 1', categoryId: category1.id, price: 100 });
      await Product.create({ name: 'Product 2', categoryId: category2.id, price: 100 });
      console.timeEnd('Product creation');

      console.time('API request');
      const response = await request(app)
        .get('/api/products/categories?categories=' + category1.id + ',' + category2.id);
      console.timeEnd('API request');

      console.log(response.status);

      expect(response.status).toBe(200); // Verifica que la respuesta sea 200
      expect(response.body.length).toBe(2); // Verifica que se obtienen dos productos
    }, 20000);


    it('should return 400 if ProductService.getProductsByCategory throws an error', async () => {
      // Mock para forzar un error en getProductsByCategory
      jest.spyOn(ProductService, 'getProductsByCategory').mockRejectedValueOnce(new Error('Mocked error'));

      // Realizar la solicitud al endpoint con un categoryId válido
      const response = await request(app).get('/api/products/category/1');

      // Validar que la respuesta tenga un código de estado 400
      expect(response.status).toBe(400);
      // Validar que el cuerpo de la respuesta contenga el mensaje de error esperado
      expect(response.body).toHaveProperty('error', 'Mocked error');
    });

    it('should return 400 if ProductService.getProductsByCategories throws an error', async () => {
      // Mock para forzar un error en getProductsByCategories
      jest.spyOn(ProductService, 'getProductsByCategories').mockRejectedValueOnce(new Error('Mocked error'));

      // Realizar la solicitud al endpoint con parámetros válidos
      const response = await request(app).get('/api/products/categories').query({
        categories: '1,2', // Mock de categorías válidas
        sort: 'name,ASC',
        limit: 10,
        offset: 0,
      });

      // Validar que la respuesta tenga un código de estado 400
      expect(response.status).toBe(400);
      // Validar que el cuerpo de la respuesta contenga el mensaje de error esperado
      expect(response.body).toHaveProperty('error', 'Mocked error');
    });

  });
});