var express = require('express');
var router = express.Router();
var ProductModel = require('../models/ProductModel');
var CategoryModel = require('../models/CategoryModel');
var authMiddleware = require('../middleware/auth');

// ============ CATEGORY API ENDPOINTS ============

// GET /api/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await CategoryModel.find({});
        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// GET /api/categories/:id - Get single category by ID
router.get('/categories/:id', async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
});

// POST /api/categories - Create new category (Admin only)
router.post('/categories', authMiddleware.ensureAdmin, async (req, res) => {
    try {
        const category = await CategoryModel.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
});

// PUT /api/categories/:id - Update category (Admin only)
router.put('/categories/:id', authMiddleware.ensureAdmin, async (req, res) => {
    try {
        const category = await CategoryModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
});

// DELETE /api/categories/:id - Delete category (Admin only)
router.delete('/categories/:id', authMiddleware.ensureAdmin, async (req, res) => {
    try {
        const category = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        res.json({
            success: true,
            message: 'Category deleted successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
});

// ============ PRODUCT API ENDPOINTS ============

// GET /api/products - Get all products (with optional category filter)
router.get('/products', async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }
        const products = await ProductModel.find(filter).populate('category');
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// GET /api/products/:id - Get single product by ID
router.get('/products/:id', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// POST /api/products - Create new product (Admin only)
router.post('/products', authMiddleware.ensureAdmin, async (req, res) => {
    try {
        const product = await ProductModel.create(req.body);
        const populatedProduct = await ProductModel.findById(product._id).populate('category');
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/products/:id', authMiddleware.ensureAdmin, async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/products/:id', authMiddleware.ensureAdmin, async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
});

// GET /api/categories/:id/products - Get all products in a category
router.get('/categories/:id/products', async (req, res) => {
    try {
        const products = await ProductModel.find({ category: req.params.id }).populate('category');
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

module.exports = router;
