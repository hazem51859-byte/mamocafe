const express = require('express');
const router = express.Router();
const licensing = require('../services/licensing');

// GET /api/license/status - Check activation status
router.get('/status', (req, res) => {
  const status = licensing.checkActivationStatus();
  res.json(status);
});

// GET /api/license/machine-id - Get machine hardware ID
router.get('/machine-id', (req, res) => {
  res.json({
    machineId: licensing.getPrimaryMachineId()
  });
});

// POST /api/license/activate - Activate with license key
router.post('/activate', (req, res) => {
  const { licenseKey } = req.body;
  if (!licenseKey) {
    return res.status(400).json({ error: 'يرجى إدخال مفتاح التفعيل' });
  }

  try {
    const result = licensing.activateWithKey(licenseKey);
    res.json({
      success: true,
      message: 'تم تفعيل النظام بنجاح وترخيصه لهذا الجهاز مدى الحياة!',
      machineId: result.machineId
    });
  } catch (err) {
    res.status(400).json({
      error: err.message || 'فشل تفعيل النظام، يرجى التأكد من صحة المفتاح'
    });
  }
});

module.exports = router;
