#!/usr/bin/env node

/**
 * ZoTech POS — Master License Key Generator CLI
 * Usage: node tools/keygen.js <MACHINE_ID>
 * Example: node tools/keygen.js ZT-5E4F-8CB0-6B47
 */

const { generateLicenseKey } = require('../server/services/licensing');

const args = process.argv.slice(2);
const machineId = args[0];

if (!machineId) {
  console.log('\n======================================================');
  console.log('  ZoTech POS — مولد مفاتيح التفعيل والترخيص الرسمي');
  console.log('======================================================\n');
  console.log('طريقة الاستخدام:');
  console.log('  node tools/keygen.js <كود_الجهاز>\n');
  console.log('مثال:');
  console.log('  node tools/keygen.js ZT-5E4F-8CB0-6B47\n');
  process.exit(1);
}

const cleanId = machineId.trim().toUpperCase();
const licenseKey = generateLicenseKey(cleanId);

console.log('\n======================================================');
console.log('  ZoTech POS — ترخيص جهاز جديد (LifeTime License)');
console.log('======================================================');
console.log(`كود الجهاز (Machine ID):    ${cleanId}`);
console.log(`مفتاح التفعيل (License Key): \x1b[32m\x1b[1m${licenseKey}\x1b[0m`);
console.log('======================================================');
console.log('تم إنشاء المفتاح بنجاح. أرسل هذا المفتاح للعميل للتفعيل.\n');
