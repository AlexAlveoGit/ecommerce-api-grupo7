// Mock the models before requiring the service
jest.mock('../../models/product', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    belongsTo: jest.fn()  // Mock the association method
  }));

  jest.mock('../../models/category', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }));

  // Now require the service after the mocks are set up
  const ProductService = require('../../services/productService');
  const Product = require('../../models/product');
  const Category = require('../../models/category');

describe('ProductService', () => {
    // Clear all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('should return all products', async () => {
            // Mock de Product.findAll
            Product.findAll.mockResolvedValue([{ id: 1, name: 'Test Product' }]);
    
            const result = await ProductService.getAllProducts();
    
            expect(Product.findAll).toHaveBeenCalled(); // Validar que el mock se llama
            expect(result).toEqual([{ id: 1, name: 'Test Product' }]); // Validar el resultado
        });

        it('should throw an error if Product.findAll fails', async () => {
            Product.findAll.mockRejectedValue(new Error('Database error'));
        
            await expect(ProductService.getAllProducts()).rejects.toThrow('Database error');
            expect(Product.findAll).toHaveBeenCalled(); // Verifica que se intentó llamar al método
        });
        

    });

    describe('getProductById', () => {
        it('should return a product when it exists', async () => {
            // Mock de Product.findByPk
            Product.findByPk.mockResolvedValue({ id: 1, name: 'Test Product' });
    
            const result = await ProductService.getProductById(1);
    
            expect(Product.findByPk).toHaveBeenCalledWith(1); // Validar que se llama con el ID correcto
            expect(result).toEqual({ id: 1, name: 'Test Product' }); // Validar el resultado
        });
    
        it('should return null when product does not exist', async () => {
            // Mock de Product.findByPk
            Product.findByPk.mockResolvedValue(null);
    
            const result = await ProductService.getProductById(999);
    
            expect(Product.findByPk).toHaveBeenCalledWith(999); // Validar que se llama con el ID correcto
            expect(result).toBeNull(); // Validar que no hay resultado
        });

        it('should throw an error if Product.findByPk fails', async () => {
            Product.findByPk.mockRejectedValue(new Error('Database error'));
        
            await expect(ProductService.getProductById(1)).rejects.toThrow('Database error');
        
            expect(Product.findByPk).toHaveBeenCalledWith(1);
        });

        it('should return null if the product does not exist', async () => {
            Product.findByPk.mockResolvedValue(null); // Simula que no existe el producto
        
            const result = await ProductService.getProductById(999);
        
            expect(Product.findByPk).toHaveBeenCalledWith(999); // Verifica que se llama con el ID correcto
            expect(result).toBeNull(); // Valida que devuelve null
        });
        
        

    });

    describe('createProduct', () => {
        it('should throw an error if category does not exist', async () => {
            // Mock de Category.findByPk
            Category.findByPk.mockResolvedValue(null);
    
            const product = { name: 'New Product', categoryId: 999 };
    
            await expect(ProductService.createProduct(product)).rejects.toThrow(
                'Category with id 999 does not exist'
            );
    
            expect(Category.findByPk).toHaveBeenCalledWith(999); // Validar el ID de categoría
        });


        it('should throw an error if category does not exist', async () => {
            // Mock de Category.findByPk
            Category.findByPk.mockResolvedValue(null);
    
            const product = { name: 'New Product', categoryId: 999 };
    
            await expect(ProductService.createProduct(product)).rejects.toThrow(
                'Category with id 999 does not exist'
            );
    
            expect(Category.findByPk).toHaveBeenCalledWith(999); // Validar el ID de categoría
        });

        it('should throw an error if Category.findByPk fails', async () => {
            Category.findByPk.mockRejectedValue(new Error('Database error'));
        
            const product = { name: 'Test Product', categoryId: 1 };
        
            await expect(ProductService.createProduct(product)).rejects.toThrow('Database error');
        
            expect(Category.findByPk).toHaveBeenCalledWith(1);
        });
    
        it('should create a product when category exists', async () => {
            // Mock de Category.findByPk y Product.create
            Category.findByPk.mockResolvedValue({ id: 1 });
            Product.create.mockResolvedValue({ id: 1, name: 'New Product', categoryId: 1 });
    
            const product = { name: 'New Product', categoryId: 1 };
    
            const result = await ProductService.createProduct(product);
    
            expect(Category.findByPk).toHaveBeenCalledWith(1); // Validar categoría
            expect(Product.create).toHaveBeenCalledWith(product); // Validar producto creado
            expect(result).toEqual({ id: 1, name: 'New Product', categoryId: 1 });
        });

        it('should throw an error if required fields are missing in createProduct', async () => {
            const product = { categoryId: 1 }; // Falta el campo 'name'
        
            await expect(ProductService.createProduct(product)).rejects.toThrow(
                'Product name is required'
            );
        
            expect(Product.create).not.toHaveBeenCalled(); // No debe intentar crear el producto
        });
        
        it('should throw an error if the category does not exist in createProduct', async () => {
            Category.findByPk.mockResolvedValue(null); // Simula que la categoría no existe
        
            const product = { name: 'Test Product', categoryId: 999 };
        
            await expect(ProductService.createProduct(product)).rejects.toThrow(
                'Category with id 999 does not exist'
            );
        
            expect(Category.findByPk).toHaveBeenCalledWith(999); // Verifica la llamada correcta
            expect(Product.create).not.toHaveBeenCalled(); // No debe intentar crear el producto
        });

        it('should throw an error if categoryId is missing', async () => {
            // Producto de prueba sin categoryId
            const product = { name: 'Test Product' }; // categoryId falta aquí
        
            // Verifica que se lanza el error esperado
            await expect(ProductService.createProduct(product)).rejects.toThrow(
                'Category ID is required'
            );
        
            // Verifica que no se intentó buscar la categoría ni crear el producto
            expect(Category.findByPk).not.toHaveBeenCalled();
            expect(Product.create).not.toHaveBeenCalled();
        });

    });


    

    describe('getProductsByCategory', () => {
  
        it('should handle undefined options in getProductsByCategory', async () => {
            Product.findAll.mockResolvedValue([{ id: 1, name: 'Test Product', categoryId: 1 }]);
        
            const result = await ProductService.getProductsByCategory(1);
        
            expect(Product.findAll).toHaveBeenCalledWith({
                where: { categoryId: 1 },
                include: Category,
                order: undefined,
                limit: undefined,
                offset: undefined,
            });
        
            expect(result).toEqual([{ id: 1, name: 'Test Product', categoryId: 1 }]);
        });

        it('should return an empty array if no products are found in the category', async () => {
            Product.findAll.mockResolvedValue([]); // Simula que no hay productos
        
            const options = { sort: 'name,ASC', limit: 10, offset: 0 };
            const result = await ProductService.getProductsByCategory(1, options);
        
            expect(result).toEqual([]); // Valida que devuelve un array vacío
        });
        
        it('should return all products for a category without filters', async () => {
            Product.findAll.mockResolvedValue([{ id: 1, name: 'Test Product', categoryId: 1 }]);
        
            const result = await ProductService.getProductsByCategory(1);
        
            expect(result).toEqual([{ id: 1, name: 'Test Product', categoryId: 1 }]); // Valida el resultado
        });
        
        
        it('should return all products for a category when no filters are provided', async () => {
            Product.findAll.mockResolvedValue([{ id: 1, name: 'Test Product', categoryId: 1 }]);
        
            const result = await ProductService.getProductsByCategory(1);
        
            expect(result).toEqual([{ id: 1, name: 'Test Product', categoryId: 1 }]); // Valida el resultado
        });
        

        it('should correctly parse and add offset to queryOptions in getProductsByCategory', async () => {
            // Mock de Product.findAll para simular una respuesta vacía
            Product.findAll.mockResolvedValue([]);
        
            // Opciones con offset especificado
            const options = { offset: '15' }; // Offset como string para validar parseInt
        
            const result = await ProductService.getProductsByCategory(1, options);
        
            // Verifica que Product.findAll se llamó con el offset correcto
            expect(Product.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { categoryId: 1 },
                    offset: 15, // Verifica que el offset fue parseado correctamente
                })
            );
        
            // Verifica que el resultado sea un array vacío
            expect(result).toEqual([]);
        });

    });


    describe('getProductsByCategories', () => {
  
        it('should throw an error if categories parameter is not provided', async () => {
            await expect(ProductService.getProductsByCategories()).rejects.toThrow(
                'Categories parameter is required'
            );
        
            expect(Product.findAll).not.toHaveBeenCalled(); // No debe intentar buscar productos
        });

        
        it('should correctly add sort to queryOptions if specified', async () => {
            Product.findAll.mockResolvedValue([]);
        
            const options = { sort: 'name,ASC' };
            const result = await ProductService.getProductsByCategories('1', options);
        
            expect(Product.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    order: [['name', 'ASC']],
                })
            );
        
            expect(result).toEqual([]); // Valida que el resultado sea un array vacío
        });
        
        it('should correctly add limit to queryOptions if specified', async () => {
            Product.findAll.mockResolvedValue([]);
        
            const options = { limit: '10' }; // Limit como string para validar parseInt
            const result = await ProductService.getProductsByCategories('1', options);
        
            expect(Product.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 10,
                })
            );
        
            expect(result).toEqual([]); // Valida que el resultado sea un array vacío
        });
        
        it('should correctly add offset to queryOptions if specified', async () => {
            Product.findAll.mockResolvedValue([]);
        
            const options = { offset: '15' }; // Offset como string para validar parseInt
            const result = await ProductService.getProductsByCategories('1', options);
        
            expect(Product.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    offset: 15,
                })
            );
        
            expect(result).toEqual([]); // Valida que el resultado sea un array vacío
        });
        

    });

    describe('updateProduct', () => {


        it('should return null if the product to update does not exist', async () => {
            Product.update.mockResolvedValue([0]); // Ninguna fila afectada
        
            const updatedProduct = { name: 'Updated Product' };
            const result = await ProductService.updateProduct(999, updatedProduct);
        
            expect(Product.update).toHaveBeenCalledWith(updatedProduct, { where: { id: 999 } });
            expect(result).toEqual([0]); // Valida que devuelve [0]
        });

        it('should throw an error if the category does not exist when updating a product', async () => {
            // Simula que Category.findByPk no encuentra la categoría
            Category.findByPk.mockResolvedValue(null);
        
            // Datos del producto a actualizar, con una categoría inexistente
            const updatedProduct = { categoryId: 999, name: 'Updated Product' };
        
            // Verifica que se lanza el error esperado
            await expect(ProductService.updateProduct(1, updatedProduct)).rejects.toThrow(
                'Category with id 999 does not exist'
            );
        
            // Verifica que Category.findByPk se llamó con el ID correcto
            expect(Category.findByPk).toHaveBeenCalledWith(999);
        
            // Verifica que Product.update no fue llamado
            expect(Product.update).not.toHaveBeenCalled();
        });
        
    });

    describe('deleteProduct', () => {
        it('should delete a product', async () => {
            // Mock de Product.destroy
            Product.destroy.mockResolvedValue(1); // 1 fila afectada
    
            const result = await ProductService.deleteProduct(1);
    
            expect(Product.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toBe(1); // Validar que se eliminó un producto
        });
    
        it('should return 0 if no product was deleted', async () => {
            // Mock de Product.destroy
            Product.destroy.mockResolvedValue(0); // Ninguna fila afectada
    
            const result = await ProductService.deleteProduct(999);
    
            expect(Product.destroy).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(result).toBe(0); // Validar que no se eliminó ningún producto
        });

        it('should return 0 if the product to delete does not exist', async () => {
            Product.destroy.mockResolvedValue(0);
        
            const result = await ProductService.deleteProduct(999);
        
            expect(Product.destroy).toHaveBeenCalledWith({ where: { id: 999 } });
            expect(result).toBe(0);
        });

        it('should throw an error if Product.destroy fails', async () => {
            Product.destroy.mockRejectedValue(new Error('Database error'));
        
            await expect(ProductService.deleteProduct(1)).rejects.toThrow('Database error');
            expect(Product.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        });
        
        it('should throw an error if Product.destroy fails', async () => {
            Product.destroy.mockRejectedValue(new Error('Database error'));
        
            await expect(ProductService.deleteProduct(1)).rejects.toThrow('Database error');
            expect(Product.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
        });
        

    });
    


});