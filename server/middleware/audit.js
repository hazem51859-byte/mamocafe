const { db } = require('../db');

function logAudit(userId, username, action, details = '', ipAddress = '') {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, details, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(userId || null, username || 'SYSTEM', action, typeof details === 'object' ? JSON.stringify(details) : details, ipAddress || '127.0.0.1');
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

module.exports = { logAudit };
