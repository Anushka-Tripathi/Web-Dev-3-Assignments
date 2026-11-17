const Product = require('../models/Product');

// GET /api/products/low-stock
const getLowStockProducts = async (req, res, next) => {
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
};

// GET /api/products/summary
const getInventorySummary = async (req, res, next) => {
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
};

// GET /api/products
const getProducts = async (req, res, next) => {
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
};

// POST /api/products
const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
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
};

// PATCH /api/products/:id/stock
const updateStock = async (req, res, next) => {
    try {
        const { change } = req.body;
        if (typeof change !== 'number' || Number.isNaN(change)) {
            return res.status(400).json({
                error: 'change must be a valid number (positive for restock, negative for sale).'
            });
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
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
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
};

module.exports = {
    getLowStockProducts,
    getInventorySummary,
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    updateStock,
    deleteProduct
};