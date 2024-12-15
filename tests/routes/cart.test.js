const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { initTestDb, closeTestDb } = require("../setup/testDb");
const cartRouter = require("../../routes/cart");
const Cart = require("../../models/cart");
const Product = require("../../models/product");
const Category = require("../../models/category");
const CartItem = require("../../models/cartItem");

const app = express();
app.use(bodyParser.json());
app.use("/api/carts", cartRouter);

describe("Cart Routes", () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Cart.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  describe("test route POST /api/carts/:userId", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return 201 ok", async () => {
      // Arrange
      const userId = "new-user";
      Cart.create({ userId });

      // Act
      const response = await request(app).post(`/api/carts/${userId}`).send();

      // Assert
      expect(response.status).toBe(201);
      expect(response.json).not.toBeNull();
      expect(response.body.id).toBe(2);
      expect(response.body.userId).toBe("new-user");
      expect(response).toHaveProperty("body.updatedAt");
      expect(response).toHaveProperty("body.createdAt");
    });

    it("should return 400 on create cart for user", async () => {
      // Arrange
      const userId = 1;

      jest.spyOn(Cart, "create");
      Cart.create.mockRejectedValue(new Error("User not found"));

      // Act
      const response = await request(app).post(`/api/carts/${userId}`).send();

      // Assert
      expect(response.status).toBe(400);
      expect(response.json).not.toBeNull();
      expect(response.body.error).toBe("User not found");
    });
  });

  describe("test route POST /api/carts/:cartId/items", () => {
    let cart, product;

    beforeEach(async () => {
      const category = await Category.create({ name: "Test Category" });
      product = await Product.create({
        name: "Test Product",
        price: 100,
        inventory: 10,
        categoryId: category.id,
      });
      cart = await Cart.create({ userId: "1" });
    });

    it("should add item to cart", async () => {
      // Act
      const response = await request(app)
        .post(`/api/carts/${cart.id}/items`)
        .send({ productId: product.id, quantity: 2 });
      console.log(response.body);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.id).toBe(1);
    });

    it("should return 400 if product not found", async () => {
      // Act
      const response = await request(app)
        .post(`/api/carts/${cart.id}/items`)
        .send({ productId: 100, quantity: 2 });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Product not found");
    });
  });

  describe("test route GET /api/carts/:cartId/items", () => {
    let cart, product, cartItem;

    beforeEach(async () => {
      const category = await Category.create({ name: "Test Category" });
      product = await Product.create({
        name: "Test Product",
        price: 100,
        inventory: 10,
        categoryId: category.id,
      });
      cart = await Cart.create({ userId: "1" });
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        quantity: 2,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should return cart items with totals", async () => {
      // Act
      const response = await request(app).get(`/api/carts/${cart.id}/items`);
      console.log(response.body);
      console.log(cartItem);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
    });

    it("should return 400 when fetching error", async () => {
      // Arrange
      jest.spyOn(CartItem, "findAll");
      CartItem.findAll.mockRejectedValue(
        new Error("Error fetching cart items")
      );

      // Act
      const response = await request(app).get(`/api/carts/100/items`);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("test route PUT /api/carts/:cartId/items/:itemId", () => {
    let cart, product, cartItem;

    beforeEach(async () => {
      const category = await Category.create({ name: "Test Category" });
      product = await Product.create({
        name: "Test Product",
        price: 100,
        inventory: 10,
        categoryId: category.id,
      });
      cart = await Cart.create({ userId: "1" });
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        quantity: 2,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should update cart item", async () => {
      // Act
      const response = await request(app)
        .put(`/api/carts/${cart.id}/items/${cartItem.id}`)
        .send({ quantity: 3 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(3);
    });

    it("should return 400 when fetching error", async () => {
      // Arrange
      jest.spyOn(CartItem, "findByPk");
      CartItem.findByPk.mockRejectedValue(new Error("Cart item not found"));

      // Act
      const response = await request(app)
        .put(`/api/carts/${cart.id}/items/100`)
        .send({ quantity: 3 });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("test route DELETE /api/carts/:cartId/items/:itemId", () => {
    let cart, product, cartItem;

    beforeEach(async () => {
      const category = await Category.create({ name: "Test Category" });
      product = await Product.create({
        name: "Test Product",
        price: 100,
        inventory: 10,
        categoryId: category.id,
      });
      cart = await Cart.create({ userId: "1" });
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        quantity: 2,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should delete cart item", async () => {
      // Act
      const response = await request(app).delete(
        `/api/carts/${cart.id}/items/${cartItem.id}`
      );

      // Assert
      expect(response.status).toBe(204);
    });

    it("should return 400 when trying to delete", async () => {
      // Arrange
      jest.spyOn(CartItem, "findByPk");
      CartItem.findByPk.mockRejectedValue(new Error("Cart item not found"));

      // Act
      const response = await request(app).delete(
        `/api/carts/${cart.id}/items/100`
      );

      // Assert
      expect(response.status).toBe(400);
    });
  });
});
