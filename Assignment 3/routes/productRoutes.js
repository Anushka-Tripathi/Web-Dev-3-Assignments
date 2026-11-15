const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { validateCreateProduct, validateUpdateProduct } = require('../middlewares/validateProduct');

// 1. Low-Stock Alert Report: GET /api/products/low-stock
router.get('/low-stock', async (req, res, next) => {
    try {
        const lowStockItems = await Product.find({
            $expr: { $lte: ['$quantity', '$reorderLevel'] }
        });

        res.status(200).json({
            count: lowStockItems.length,
            lowStockItems
        });
    } catch (err) {
        next(err);
    }
});

// 2. Category-wise Inventory Summary (Aggregation): GET /api/products/summary
router.get('/summary', async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
                    avgPrice: { $avg: '$price' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            categories: summary.length,
            summary
        });
    } catch (err) {
        next(err);
    }
});

// 3. Get All Products (Filtering, Searching, Sorting & Pagination): GET /api/products
router.get('/', async (req, res, next) => {
    try {
        const {
            category,
            supplier,
            search,
            minPrice,
            maxPrice,
            sort = '-createdAt',
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (supplier) {
            filter.supplier = { $regex: new RegExp(supplier, 'i') };
        }
        if (search) {
            filter.$or = [
                { name: { $regex: new RegExp(search, 'i') } },
                { sku: { $regex: new RegExp(search, 'i') } }
            ];
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
            if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNum - 1) * limitNum;

        const [total, products] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
        ]);

        res.status(200).json({
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            count: products.length,
            products
        });
    } catch (err) {
        next(err);
    }
});

// 4. Create Product: POST /api/products
router.post('/', validateCreateProduct, async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
});

// 5. Get Single Product by ID: GET /api/products/:id
router.get('/:id', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
});

// 6. Update Product Details: PUT /api/products/:id
router.put('/:id', validateUpdateProduct, async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
});

// 7. Stock Adjustment (Restock / Sale): PATCH /api/products/:id/stock
router.patch('/:id/stock', async (req, res, next) => {
    try {
        const { change } = req.body;
        if (typeof change !== 'number' || Number.isNaN(change)) {
            return res.status(400).json({ error: 'change must be a valid number (positive for restock, negative for sale).' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updatedQuantity = product.quantity + change;
        if (updatedQuantity < 0) {
            return res.status(400).json({
                error: `Insufficient stock. Current quantity is ${product.quantity}, cannot apply change of ${change}.`
            });
        }

        product.quantity = updatedQuantity;
        await product.save();

        res.status(200).json({
            message: 'Stock updated',
            product
        });
    } catch (err) {
        next(err);
    }
});

// 8. Delete Product: DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product deleted',
            id: product._id.toString()
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;