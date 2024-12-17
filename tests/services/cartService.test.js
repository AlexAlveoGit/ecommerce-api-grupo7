// Mock the models
jest.mock('../../models/cart', () => ({
  create: jest.fn(),
  findByPk: jest.fn()
}));

jest.mock('../../models/cartItem', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn()
}));

jest.mock('../../models/product', () => ({
  findByPk: jest.fn()
}));

const CartService = require('../../services/cartService');
const Cart = require('../../models/cart');
const CartItem = require('../../models/cartItem');
const Product = require('../../models/product');

describe('CartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCart', () => {
    it('should create a new cart', async () => {

    });
  });

  describe('addItemToCart', () => {
    const mockProduct = { id: 1, inventory: 10, price: 100 };
    const mockCartItem = { cartId: 1, productId: 1, quantity: 2, save: jest.fn() };

    it('should add item to cart when inventory is available', async () => {
      // Arrange
      jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct);
      jest.spyOn(CartItem, 'findOne').mockResolvedValue(mockCartItem);

      // Act
      const result = await CartService.addItemToCart(1, 1, 3);

      // Assert
      expect(result).toEqual(mockCartItem);
    });

    it('should return error for inventory higher than new quantity', async () => {
      // Arrange
      jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct);
      jest.spyOn(CartItem, 'findOne').mockResolvedValue({ cartId: 1, productId: 1, quantity: 200, save: jest.fn() });

      // Assert
      expect(async () => await CartService.addItemToCart(1, 1, 2)).rejects.toThrow('Not enough inventory available');
    });

    it('should return error for quantity higher than inventory', async () => {
      jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct);

      expect(async () => await CartService.addItemToCart(1, 1, 100)).rejects.toThrow('Not enough inventory available');
    });
  });

  describe('getCartItems', () => {
    it('should return cart items with calculated totals', async () => {

    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity when sufficient inventory', async () => {

    });
  });

  describe('removeCartItem', () => {
    it('should remove cart item successfully', async () => {

    });
  });
});