const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/users - List all users with roles
router.get('/', authenticateToken, requirePermission('manage_users'), (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.full_name, u.role_id, u.phone, u.is_active, u.custom_permissions, u.created_at,
           r.name as role_name, r.display_name as role_display, r.permissions as role_permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.id ASC
  `).all();

  const roles = db.prepare('SELECT * FROM roles').all();

  users.forEach(u => {
    try {
      u.role_permissions = JSON.parse(u.role_permissions || '[]');
      u.custom_permissions = JSON.parse(u.custom_permissions || '[]');
    } catch (e) {
      u.role_permissions = [];
      u.custom_permissions = [];
    }
  });

  roles.forEach(r => {
    try {
      r.permissions = JSON.parse(r.permissions || '[]');
    } catch (e) {
      r.permissions = [];
    }
  });

  res.json({ users, roles });
});

// POST /api/users - Create new user
router.post('/', authenticateToken, requirePermission('manage_users'), (req, res) => {
  const { username, password, fullName, roleId, phone = '', customPermissions = [] } = req.body;

  if (!username || !password || !fullName || !roleId) {
    return res.status(400).json({ error: 'يرجى استكمال الحقول المطلوبة (اسم المستخدم، كلمة المرور، الاسم بالكامل، والدور)' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
  if (existing) {
    return res.status(400).json({ error: 'اسم المستخدم هذا مسجل بالفعل' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const result = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role_id, phone, is_active, custom_permissions)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `).run(username.trim(), hash, fullName.trim(), roleId, phone, JSON.stringify(customPermissions));

  logAudit(req.user.id, req.user.username, 'USER_CREATED', `إنشاء مستخدم جديد: ${username} (${fullName})`, req.ip);

  res.json({ success: true, id: result.lastInsertRowid, message: 'تم إنشاء المستخدم بنجاح' });
});

// PUT /api/users/:id - Update user details & permissions
router.put('/:id', authenticateToken, requirePermission('manage_users'), (req, res) => {
  const id = req.params.id;
  const { fullName, roleId, phone, customPermissions, isActive } = req.body;

  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  db.prepare(`
    UPDATE users SET
      full_name = ?, role_id = ?, phone = ?, is_active = ?, custom_permissions = ?
    WHERE id = ?
  `).run(
    fullName || current.full_name,
    roleId || current.role_id,
    phone !== undefined ? phone : current.phone,
    isActive !== undefined ? (isActive ? 1 : 0) : current.is_active,
    customPermissions ? JSON.stringify(customPermissions) : current.custom_permissions,
    id
  );

  logAudit(req.user.id, req.user.username, 'USER_UPDATED', `تعديل بيانات المستخدم: ${current.username}`, req.ip);

  res.json({ success: true, message: 'تم تحديث بيانات المستخدم بنجاح' });
});

// PUT /api/users/:id/reset-password - Reset password
router.put('/:id/reset-password', authenticateToken, requirePermission('manage_users'), (req, res) => {
  const id = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'يرجى إدخال كلمة مرور جديدة لا تقل عن 4 خانات' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword, salt);

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);

  logAudit(req.user.id, req.user.username, 'PASSWORD_RESET', `إعادة تعيين كلمة المرور للمستخدم رقم ${id}`, req.ip);

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

module.exports = router;
