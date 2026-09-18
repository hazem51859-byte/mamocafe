const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/expenses - List expenses with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT e.*, s.id as shift_number
      FROM expenses e
      LEFT JOIN shifts s ON e.shift_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ` AND e.category = ?`;
      params.push(category);
    }
    if (startDate) {
      query += ` AND e.expense_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND e.expense_date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY e.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const expenses = await db.prepare(query).all(...params);

    // Summary by category and total
    const summary = (await db.prepare(`
      SELECT COUNT(*) as total_count,
             COALESCE(SUM(amount), 0) as total_amount
      FROM expenses
    `).get()) || {};

    const byCategory = await db.prepare(`
      SELECT category, COUNT(*) as count, SUM(amount) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    `).all();

    res.json({ expenses, summary, byCategory });
  } catch (err) {
    console.error('Error listing expenses:', err);
    res.status(500).json({ error: 'خطأ في جلب المصروفات' });
  }
});

// POST /api/expenses - Add expense
router.post('/', authenticateToken, requirePermission('manage_expenses'), async (req, res) => {
  try {
    const {
      category,
      amount,
      expenseDate = new Date().toISOString().slice(0, 10),
      employeeName,
      notes = '',
      deductFromShift = true
    } = req.body;

    const amt = parseFloat(amount);
    if (!category || isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال بند المصروف ومبلغ صحيح' });
    }

    // Active shift check
    let shiftId = null;
    if (deductFromShift) {
      const activeShift = await db.prepare(`
        SELECT id FROM shifts WHERE (cashier_id = ? OR status = 'open') AND status = 'open' ORDER BY id DESC LIMIT 1
      `).get(req.user.id);
      if (activeShift) {
        shiftId = activeShift.id;
      }
    }

    const result = await db.prepare(`
      INSERT INTO expenses (category, amount, expense_date, shift_id, employee_name, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(category, amt, expenseDate, shiftId, employeeName || req.user.full_name, notes);

    logAudit(
      req.user.id,
      req.user.username,
      'EXPENSE_RECORDED',
      `تسجيل مصروف [${category}] بقيمة ${amt.toFixed(2)} ج.م (البيان: ${notes})`,
      req.ip
    );

    res.json({ success: true, id: result.lastInsertRowid, message: 'تم تسجيل المصروف بنجاح' });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ error: 'خطأ في تسجيل المصروف' });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', authenticateToken, requirePermission('manage_expenses'), async (req, res) => {
  try {
    const id = req.params.id;
    const exp = await db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);

    if (!exp) {
      return res.status(404).json({ error: 'المصروف غير موجود' });
    }

    await db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    logAudit(req.user.id, req.user.username, 'EXPENSE_DELETED', `حذف مصروف بقيمة ${exp.amount} ج.م [${exp.category}]`, req.ip);

    res.json({ success: true, message: 'تم حذف المصروف بنجاح' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'خطأ في حذف المصروف' });
  }
});

module.exports = router;
