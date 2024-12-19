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

    it('should return error for quantity higher than inventory', async () => {
      jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct);

      expect(async () => await CartService.addItemToCart(1, 1, 201)).rejects.toThrow('Not enough inventory available');
    });


    it('should return error for quantity higher than inventory', async () => {
      jest.spyOn(Product, 'findByPk').mockResolvedValue(mockProduct);

      expect(async () => await CartService.addItemToCart(1, 1, 10)).rejects.toThrow('Not enough inventory available');
    });

  });

  describe('getCartItems', () => {
    it('should return cart items with calculated totals', async () => {



    });


    it('should throw an error if no cartId is provided', async () => {
      // Arrange
      const invalidCartId = null; // CartId no válido
      jest.spyOn(CartItem, 'findAll').mockResolvedValue([]);

      // Act & Assert
      await expect(async () => await CartService.getCartItems(invalidCartId))
        .rejects
        .toThrow('Cart ID is required'); // Mensaje esperado cuando no hay cartId

      // Verifica que no se haya llamado a CartItem.findAll
      expect(CartItem.findAll).not.toHaveBeenCalled();
    });

  });

  describe('updateCartItem', () => {
    it('should update cart item quantity when sufficient inventory', async () => {

    });

    it('should throw an error if product inventory is less than the requested quantity', async () => {
      // Arrange
      const mockItemId = 1;
      const mockQuantity = 10;

      const mockCartItem = {
          Product: { inventory: 5 }, // Inventario menor a la cantidad solicitada
          save: jest.fn()
      };

      // Mock del método findByPk para retornar un item
      jest.spyOn(CartItem, 'findByPk').mockResolvedValue(mockCartItem);

      // Act
      const result = await expect(
          CartService.updateCartItem(mockItemId, mockQuantity)
      );

      // Assert
      result.rejects.toThrow('Not enough inventory available');

      // Verificar que el método save no se llamó
      expect(mockCartItem.save).not.toHaveBeenCalled();
  });

  });

  describe('removeCartItem', () => {
    it('should remove cart item successfully', async () => {

    });
  });
});