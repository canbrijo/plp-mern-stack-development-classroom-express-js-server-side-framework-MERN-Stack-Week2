// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const products = require('../../models/productModel');
const auth = require('../../middleware/auth');
const validateProduct = require('../../middleware/validation');

// GET all products
router.get('/', (req, res) => {
  let result = products;
  const { category, page = 1, limit = 5, search } = req.query;

  // Filter by category
  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Search by name
  if (search) {
    result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  // Pagination
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + parseInt(limit));

  res.json({
    total: result.length,
    page: parseInt(page),
    limit: parseInt(limit),
    products: paginated,
  });
});

// GET product by ID
router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  res.json(product);
});

// POST new product
router.post('/', auth, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = { id: require('uuid').v4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT update product
router.put('/:id', auth, validateProduct, (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  Object.assign(product, req.body);
  res.json(product);
});

// DELETE product
router.delete('/:id', auth, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  products.splice(index, 1);
  res.status(204).send();
});

// GET product statistics
router.get('/stats/count', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
});

module.exports = router;