const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.display_name as role_display, r.permissions as role_permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.username = ?
  `).get(username.trim());

  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'تم تعطيل هذا الحساب، يرجى مراجعة إدارة النظام' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  let permissions = [];
  try {
    const rolePerms = JSON.parse(user.role_permissions || '[]');
    const customPerms = JSON.parse(user.custom_permissions || '[]');
    permissions = Array.from(new Set([...rolePerms, ...customPerms]));
  } catch (e) {
    permissions = [];
  }

  const payload = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role_name
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  logAudit(user.id, user.username, 'USER_LOGIN', `تسجيل دخول ناجح للمستخدم ${user.full_name} (${user.role_display})`, req.ip);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role_name,
      role_display: user.role_display,
      permissions
    }
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/switch-user (requires password verification)
router.post('/switch-user', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور لتأكيد التبديل' });
  }

  const user = db.prepare(`
    SELECT u.*, r.name as role_name, r.display_name as role_display, r.permissions as role_permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.username = ?
  `).get(username.trim());

  if (!user || !user.is_active) {
    return res.status(404).json({ error: 'المستخدم غير موجود أو معطل' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة، لا يمكن تبديل الحساب' });
  }

  let permissions = [];
  try {
    const rolePerms = JSON.parse(user.role_permissions || '[]');
    const customPerms = JSON.parse(user.custom_permissions || '[]');
    permissions = Array.from(new Set([...rolePerms, ...customPerms]));
  } catch (e) {
    permissions = [];
  }

  const payload = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role_name
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  logAudit(user.id, user.username, 'USER_SWITCH', `تبديل الحساب السريع إلى ${user.full_name}`, req.ip);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role_name,
      role_display: user.role_display,
      permissions
    }
  });
});

// POST /api/auth/change-password (allow any logged-in user to change their own password)
router.post('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'يرجى إدخال كلمة مرور جديدة لا تقل عن 4 خانات' });
  }

  const user = db.prepare('SELECT id, password_hash, username, full_name FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  // If currentPassword is provided, verify it
  if (currentPassword) {
    const isValid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(newPassword.trim(), salt);

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  logAudit(req.user.id, user.username, 'PASSWORD_CHANGE', `قام المستخدم ${user.full_name} بتغيير كلمة المرور الخاصة به`, req.ip);

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

module.exports = router;
