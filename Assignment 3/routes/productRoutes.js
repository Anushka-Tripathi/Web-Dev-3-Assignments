const express = require('express');
const router = express.Router();
const {
    getLowStockProducts,
    getInventorySummary,
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    updateStock,
    deleteProduct
} = require('../controllers/productController');
const { validateCreateProduct, validateUpdateProduct } = require('../middlewares/validateProduct');

router.get('/low-stock', getLowStockProducts);
router.get('/summary', getInventorySummary);

router.get('/', getProducts);
router.post('/', validateCreateProduct, createProduct);

router.get('/:id', getProductById);
router.put('/:id', validateUpdateProduct, updateProduct);
router.patch('/:id/stock', updateStock);
router.delete('/:id', deleteProduct);

module.exports = router;