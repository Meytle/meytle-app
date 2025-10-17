/**
 * Service Category Routes
 * Routes for managing service categories
 */

const express = require('express');
const { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/serviceCategoryController');
const authMiddleware = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Public/Authenticated routes (all authenticated users can view)
router.get('/', getAllCategories);
router.get('/:categoryId', getCategoryById);

// Admin-only routes
router.post('/', adminAuth, createCategory);
router.put('/:categoryId', adminAuth, updateCategory);
router.delete('/:categoryId', adminAuth, deleteCategory);

module.exports = router;

