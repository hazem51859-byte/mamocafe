const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// GET /api/audit - List audit logs
router.get('/', authenticateToken, requirePermission('view_audit_logs'), (req, res) => {
  const { action, username, startDate, endDate, limit = 100, offset = 0 } = req.query;

  let query = `SELECT * FROM audit_logs WHERE 1=1`;
  const params = [];

  if (action) {
    query += ` AND action LIKE ?`;
    params.push(`%${action}%`);
  }
  if (username) {
    query += ` AND username LIKE ?`;
    params.push(`%${username}%`);
  }
  if (startDate) {
    query += ` AND date(created_at) >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND date(created_at) <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const logs = db.prepare(query).all(...params);

  res.json(logs);
});

module.exports = router;
