const { db } = require('../db');

function logAudit(userId, username, action, details = '', ipAddress = '') {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
    db.prepare(`
      INSERT INTO audit_logs (user_id, username, action, details, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId || null, username || 'SYSTEM', action, detailsStr, ipAddress || '127.0.0.1')
      .catch(err => console.error('Failed to log audit event:', err));
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

module.exports = { logAudit };
