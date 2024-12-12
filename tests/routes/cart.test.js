const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const { initTestDb, closeTestDb } = require("../setup/testDb");
const cartRouter = require("../../routes/cart");
const Cart = require("../../models/cart");
const Product = require("../../models/product");
const Category = require("../../models/category");

const CartService = require("../../services/cartService");

jest.mock("../../services/cartService");

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

  describe("POST /api/carts/:userId", () => {
    it("should return 201 ok", async () => {
      // Arrange
      const userId = "new-user";
      CartService.createCart.mockResolvedValue({
        id: 1,
        userId: userId,
        updatedAt: "2024-12-12",
        createdAt: "2024-12-12",
      });

      // Act
      const response = await request(app).post(`/api/carts/${userId}`).send();

      // Assert
      expect(response.status).toBe(201);
      expect(response.json).not.toBeNull();
      expect(response.body.id).toBe(1);
      expect(response.body.userId).toBe("new-user");
      expect(response.body.updatedAt).toBe("2024-12-12");
      expect(response.body.createdAt).toBe("2024-12-12");
    });

    it("should return 400 on create cart for user", async () => {
      // Arrange
      const userId = 1;
      CartService.createCart.mockRejectedValue(new Error("User not found"));

      // Act
      const response = await request(app).post(`/api/carts/${userId}`).send();

      // Assert
      expect(response.status).toBe(400);
      expect(response.json).not.toBeNull();
      expect(response.body.error).toBe("User not found");
    });
  });

  describe("POST /api/carts/:cartId/items", () => {
    //let cart, product;

    // beforeEach(async () => {
    //   const category = await Category.create({ name: 'Test Category' });
    //   product = await Product.create({
    //     name: 'Test Product',
    //     price: 100,
    //     inventory: 10,
    //     categoryId: category.id
    //   });
    //   cart = await Cart.create({ userId: '1' });
    // });

    it("should add item to cart", async () => {});
  });

  describe("GET /api/carts/:cartId/items", () => {
    it("should return cart items with totals", async () => {});
  });
});
