/**
 * Service Category Controller
 * Handles CRUD operations for service categories
 */

const { pool } = require('../config/database');
const config = require('../config/config');

// Supported currencies and their validation rules
const SUPPORTED_CURRENCIES = {
  'usd': { symbol: '$', decimals: 2 },
  'eur': { symbol: '€', decimals: 2 },
  'gbp': { symbol: '£', decimals: 2 },
  'cad': { symbol: 'C$', decimals: 2 },
  'aud': { symbol: 'A$', decimals: 2 }
};

/**
 * Get all service categories
 */
const getAllCategories = async (req, res) => {
  try {
    const { activeOnly } = req.query;

    let query = 'SELECT * FROM service_categories';
    const params = [];

    if (activeOnly === 'true') {
      query += ' WHERE is_active = TRUE';
    }

    query += ' ORDER BY name';

    const [categories] = await pool.execute(query, params);

    // Cast base_price to number for each category
    const categoriesWithNumericPrice = categories.map(cat => ({
      ...cat,
      base_price: Number(cat.base_price)
    }));

    res.json({
      status: 'success',
      data: categoriesWithNumericPrice
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch service categories',
      error: error.message
    });
  }
};

/**
 * Get single category by ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [categories] = await pool.execute(
      'SELECT * FROM service_categories WHERE id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service category not found'
      });
    }

    // Cast base_price to number
    const category = {
      ...categories[0],
      base_price: Number(categories[0].base_price)
    };

    res.json({
      status: 'success',
      data: category
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch service category',
      error: error.message
    });
  }
};

/**
 * Create new category (admin only)
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, basePrice, isActive } = req.body;

    // Validate required fields
    if (!name || !basePrice) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and base price are required'
      });
    }

    // Validate basePrice is a positive number
    if (isNaN(basePrice) || parseFloat(basePrice) <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Base price must be a positive number'
      });
    }

    // Validate currency compatibility
    const currency = config.stripe.currency;
    if (!SUPPORTED_CURRENCIES[currency]) {
      return res.status(400).json({
        status: 'error',
        message: `Currency ${currency} is not supported. Supported currencies: ${Object.keys(SUPPORTED_CURRENCIES).join(', ')}`
      });
    }

    // Check for duplicate name (case-insensitive)
    const [existing] = await pool.execute(
      'SELECT id FROM service_categories WHERE LOWER(name) = LOWER(?)',
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'A service category with this name already exists'
      });
    }

    // Insert new category
    const [result] = await pool.execute(
      `INSERT INTO service_categories (name, description, base_price, is_active) 
       VALUES (?, ?, ?, ?)`,
      [name, description || null, parseFloat(basePrice), isActive !== undefined ? isActive : true]
    );

    res.status(201).json({
      status: 'success',
      message: 'Service category created successfully',
      data: {
        categoryId: result.insertId,
        name,
        description: description || null,
        base_price: Number(parseFloat(basePrice)),
        is_active: isActive !== undefined ? isActive : true
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'A service category with this name already exists'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create service category',
      error: error.message
    });
  }
};

/**
 * Update existing category (admin only)
 */
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, basePrice, isActive } = req.body;

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT id FROM service_categories WHERE id = ?',
      [categoryId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service category not found'
      });
    }

    // Validate basePrice if provided
    if (basePrice !== undefined && (isNaN(basePrice) || parseFloat(basePrice) <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Base price must be a positive number'
      });
    }

    // Validate currency compatibility if basePrice is being updated
    if (basePrice !== undefined) {
      const currency = config.stripe.currency;
      if (!SUPPORTED_CURRENCIES[currency]) {
        return res.status(400).json({
          status: 'error',
          message: `Currency ${currency} is not supported. Supported currencies: ${Object.keys(SUPPORTED_CURRENCIES).join(', ')}`
        });
      }
    }

    // Check for duplicate name if name is being changed
    if (name) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM service_categories WHERE LOWER(name) = LOWER(?) AND id != ?',
        [name, categoryId]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'A service category with this name already exists'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (basePrice !== undefined) {
      updates.push('base_price = ?');
      params.push(parseFloat(basePrice));
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    params.push(categoryId);

    await pool.execute(
      `UPDATE service_categories SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      status: 'success',
      message: 'Service category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'A service category with this name already exists'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update service category',
      error: error.message
    });
  }
};

/**
 * Delete category (admin only)
 */
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT id FROM service_categories WHERE id = ?',
      [categoryId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Service category not found'
      });
    }

    // Check if category is referenced in any bookings
    const [bookings] = await pool.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE service_category_id = ?',
      [categoryId]
    );

    if (bookings[0].count > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete category. It is referenced in ${bookings[0].count} booking(s).`
      });
    }

    // Delete the category
    await pool.execute('DELETE FROM service_categories WHERE id = ?', [categoryId]);

    res.json({
      status: 'success',
      message: 'Service category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete service category',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

