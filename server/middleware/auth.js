const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'zotech-market-pos-super-secret-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'غير مصرح: يجب تسجيل الدخول أولاً' });
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً' });
    }

    try {
      // Refresh user info from DB to check if disabled
      const dbUser = await db.prepare(`
        SELECT u.id, u.username, u.full_name, u.role_id, u.is_active, u.custom_permissions,
               r.name as role_name, r.display_name as role_display, r.permissions as role_permissions
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `).get(user.id);

      if (!dbUser || !dbUser.is_active) {
        return res.status(403).json({ error: 'تم تعطيل هذا الحساب أو أنه لم يعد موجوداً' });
      }

    let permissions = [];
    try {
      const rolePerms = JSON.parse(dbUser.role_permissions || '[]');
      const customPerms = JSON.parse(dbUser.custom_permissions || '[]');
      permissions = Array.from(new Set([...rolePerms, ...customPerms]));
    } catch (e) {
      permissions = [];
    }

    req.user = {
      id: dbUser.id,
      username: dbUser.username,
      full_name: dbUser.full_name,
      role: dbUser.role_name,
      role_display: dbUser.role_display,
      permissions
    };

    next();
    } catch (err) {
      console.error('Error verifying user:', err);
      return res.status(500).json({ error: 'خطأ في التحقق من المستخدم' });
    }
  });
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'غير مصرح' });
    }
    // Super admin has all permissions
    if (req.user.role === 'super_admin') {
      return next();
    }
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: `ليس لديك الصلاحية الكافية لإتمام هذه العملية (${permission})`
      });
    }
    next();
  };
}

module.exports = { authenticateToken, requirePermission, JWT_SECRET };
