const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ZoTech Master Secret Salt — Only known to ZoTech
const ZOTECH_SECRET_SALT = 'ZoTech-POS-SuperMarket-2024-@SecretMasterKey#984405';

/**
 * Resolves the isolated, secure storage directory for database and license.
 * On Windows: C:\ProgramData\ZoTechPOS (hidden system folder)
 * On macOS / Linux: ~/.zotechpos
 */
function getSecureDataDir() {
  let baseDir;
  if (process.platform === 'win32') {
    baseDir = process.env.PROGRAMDATA || process.env.APPDATA || 'C:\\ProgramData';
  } else {
    baseDir = process.env.HOME || '/tmp';
  }
  const securePath = path.join(baseDir, process.platform === 'win32' ? 'ZoTechPOS' : '.zotechpos');
  if (!fs.existsSync(securePath)) {
    try {
      fs.mkdirSync(securePath, { recursive: true });
    } catch (e) {
      console.warn('Could not create secure directory, falling back to local storage:', e.message);
      return path.join(__dirname, '..');
    }
  }
  return securePath;
}

const LICENSE_FILE_PATH = path.join(getSecureDataDir(), 'license.lic');

/**
 * Collects all valid, physical, non-internal MAC addresses on this machine.
 */
function getCandidateMacs() {
  const nics = os.networkInterfaces();
  const macs = [];
  for (const [name, addrs] of Object.entries(nics)) {
    for (const a of addrs) {
      if (!a.internal && a.mac && a.mac !== '00:00:00:00:00:00') {
        const clean = a.mac.toLowerCase().replace(/[:-]/g, '');
        if (!macs.includes(clean)) macs.push(clean);
      }
    }
  }
  return macs;
}

/**
 * Returns the primary Machine ID formatted as ZT-XXXX-XXXX-XXXX
 */
function getPrimaryMachineId() {
  const macs = getCandidateMacs();
  if (macs.length === 0) {
    // Fallback: machine hostname + cpus hash if no network card present
    const fallback = crypto.createHash('md5').update(os.hostname() + os.arch()).digest('hex').slice(0, 12).toUpperCase();
    return 'ZT-' + fallback.slice(0, 4) + '-' + fallback.slice(4, 8) + '-' + fallback.slice(8, 12);
  }
  const primary = macs[0].toUpperCase();
  return 'ZT-' + primary.slice(0, 4) + '-' + primary.slice(4, 8) + '-' + primary.slice(8, 12);
}

/**
 * Generates an activation key for a given Machine ID using ZoTech Secret HMAC
 */
function generateLicenseKey(machineId) {
  const cleanId = machineId.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const hmac = crypto.createHmac('sha256', ZOTECH_SECRET_SALT);
  hmac.update('LIFETIME-POS-' + cleanId);
  const hash = hmac.digest('hex').toUpperCase();
  return hash.slice(0, 4) + '-' + hash.slice(4, 8) + '-' + hash.slice(8, 12) + '-' + hash.slice(12, 16);
}

/**
 * Verifies if an entered key matches ANY of the physical network adapters on this machine.
 */
function verifyKeyForCurrentMachine(enteredKey) {
  if (!enteredKey || typeof enteredKey !== 'string') return false;
  const cleanKey = enteredKey.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanKey.length !== 16) return false;

  const candidateMacs = getCandidateMacs();
  if (candidateMacs.length === 0) {
    const fallbackId = getPrimaryMachineId().replace(/[^A-Z0-9]/g, '');
    const expected = generateLicenseKey(fallbackId).replace(/[^A-Z0-9]/g, '');
    return cleanKey === expected;
  }

  for (const mac of candidateMacs) {
    const formattedId = 'ZT' + mac.toUpperCase();
    const expected = generateLicenseKey(formattedId).replace(/[^A-Z0-9]/g, '');
    if (cleanKey === expected) return true;
  }
  return false;
}

/**
 * Reads stored license and checks validity
 */
function checkActivationStatus() {
  try {
    if (!fs.existsSync(LICENSE_FILE_PATH)) {
      return { isActivated: false, machineId: getPrimaryMachineId(), reason: 'NO_LICENSE_FILE' };
    }
    const raw = fs.readFileSync(LICENSE_FILE_PATH, 'utf8').trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { key: raw };
    }

    const key = data.key || data.licenseKey;
    if (verifyKeyForCurrentMachine(key)) {
      return { isActivated: true, machineId: getPrimaryMachineId(), activatedAt: data.activatedAt };
    } else {
      return { isActivated: false, machineId: getPrimaryMachineId(), reason: 'HARDWARE_MISMATCH' };
    }
  } catch (e) {
    return { isActivated: false, machineId: getPrimaryMachineId(), reason: e.message };
  }
}

/**
 * Activates system with a given key and saves to secure location
 */
function activateWithKey(key) {
  if (!verifyKeyForCurrentMachine(key)) {
    throw new Error('مفتاح التفعيل غير صحيح أو غير متوافق مع كود هذا الجهاز');
  }

  const secureDir = getSecureDataDir();
  const payload = {
    key: key.trim().toUpperCase(),
    machineId: getPrimaryMachineId(),
    activatedAt: new Date().toISOString(),
    signedBy: 'ZoTech Software Solutions'
  };

  fs.writeFileSync(LICENSE_FILE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return { success: true, machineId: getPrimaryMachineId() };
}

module.exports = {
  getSecureDataDir,
  getPrimaryMachineId,
  generateLicenseKey,
  verifyKeyForCurrentMachine,
  checkActivationStatus,
  activateWithKey,
  LICENSE_FILE_PATH
};
