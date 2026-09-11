const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/categories - List all categories with product count
router.get('/', authenticateToken, (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as products_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.id ASC
  `).all();

  res.json(categories);
});

// POST /api/categories - Create category
router.post('/', authenticateToken, requirePermission('manage_products'), (req, res) => {
  const { name, code, icon = 'Box', sortOrder = 0 } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'اسم التصنيف مطلوب' });
  }

  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name.trim());
  if (existing) {
    return res.status(400).json({ error: 'هذا التصنيف موجود بالفعل' });
  }

  const result = db.prepare(`
    INSERT INTO categories (name, code, icon, sort_order)
    VALUES (?, ?, ?, ?)
  `).run(name.trim(), code ? code.trim() : null, icon, parseInt(sortOrder) || 0);

  logAudit(req.user.id, req.user.username, 'CATEGORY_ADDED', `إضافة تصنيف جديد: ${name}`, req.ip);

  res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة التصنيف بنجاح' });
});

// PUT /api/categories/:id - Update category
router.put('/:id', authenticateToken, requirePermission('manage_products'), (req, res) => {
  const id = req.params.id;
  const { name, code, icon, sortOrder, isActive } = req.body;

  const current = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'التصنيف غير موجود' });
  }

  db.prepare(`
    UPDATE categories SET
      name = ?, code = ?, icon = ?, sort_order = ?, is_active = ?
    WHERE id = ?
  `).run(
    name ? name.trim() : current.name,
    code !== undefined ? code : current.code,
    icon || current.icon,
    sortOrder !== undefined ? parseInt(sortOrder) : current.sort_order,
    isActive !== undefined ? (isActive ? 1 : 0) : current.is_active,
    id
  );

  logAudit(req.user.id, req.user.username, 'CATEGORY_EDITED', `تعديل تصنيف: ${name || current.name}`, req.ip);

  res.json({ success: true, message: 'تم تحديث التصنيف بنجاح' });
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', authenticateToken, requirePermission('manage_products'), (req, res) => {
  const id = req.params.id;
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id).count;

  if (productCount > 0) {
    return res.status(400).json({ error: `لا يمكن حذف هذا التصنيف لوجود ${productCount} منتج مرتبط به. يرجى نقل المنتجات أولاً` });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  logAudit(req.user.id, req.user.username, 'CATEGORY_DELETED', `حذف تصنيف رقم: ${id}`, req.ip);

  res.json({ success: true, message: 'تم حذف التصنيف بنجاح' });
});

module.exports = router;
