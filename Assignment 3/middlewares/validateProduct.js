const validateCreateProduct = (req, res, next) => {
    const { name, sku, category, price, quantity, reorderLevel, supplier } = req.body;

    if (!name || !sku || !category || price === undefined || quantity === undefined || reorderLevel === undefined || !supplier) {
        return res.status(400).json({
            error: 'Validation failed: name, sku, category, price, quantity, reorderLevel, and supplier are required.'
        });
    }

    if (typeof price !== 'number' || price < 0 || typeof quantity !== 'number' || quantity < 0 || typeof reorderLevel !== 'number' || reorderLevel < 0) {
        return res.status(400).json({
            error: 'Validation failed: price, quantity, and reorderLevel must be non-negative numbers.'
        });
    }

    next();
};

const validateUpdateProduct = (req, res, next) => {
    const { price, quantity, reorderLevel } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
        return res.status(400).json({ error: 'price must be a non-negative number.' });
    }
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
        return res.status(400).json({ error: 'quantity must be a non-negative number.' });
    }
    if (reorderLevel !== undefined && (typeof reorderLevel !== 'number' || reorderLevel < 0)) {
        return res.status(400).json({ error: 'reorderLevel must be a non-negative number.' });
    }

    next();
};

module.exports = {
    validateCreateProduct,
    validateUpdateProduct
};