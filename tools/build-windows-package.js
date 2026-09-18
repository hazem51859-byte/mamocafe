const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const JavaScriptObfuscator = require('javascript-obfuscator');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'ZoTech_Market_POS_Windows');
const CACHE_DIR = path.join(__dirname, 'cache');
const WIN_NODE_CACHE = path.join(CACHE_DIR, 'node-win-x64.exe');
const WIN_NODE_URL = 'https://nodejs.org/dist/v22.13.1/win-x64/node.exe';

// Use node.exe directly to run vite build - no npm needed
const NODE_EXE = `"${process.execPath}"`;
const VITE_BIN = path.join(ROOT_DIR, 'client', 'node_modules', 'vite', 'bin', 'vite.js');

console.log('\n=============================================================');
console.log('  🚀 بدء تجهيز وتشفير حزمة نظام ZoTech POS لنظام Windows');
console.log('=============================================================\n');

// 1. Build Client - use pre-built dist if available, otherwise try to build
console.log('📦 1/6 بناء الواجهة الأمامية وتجهيز ملفات الإنتاج...');
const CLIENT_DIST = path.join(ROOT_DIR, 'client', 'dist');
if (fs.existsSync(CLIENT_DIST) && fs.existsSync(path.join(CLIENT_DIST, 'index.html'))) {
  console.log('⚡ استخدام client/dist المبني مسبقاً...');
} else {
  // Try to build using vite directly
  if (!fs.existsSync(VITE_BIN)) {
    throw new Error('client/dist غير موجود ولا يمكن بناء الواجهة. شغّل: npm run build --prefix client أولاً.');
  }
  execSync(`${NODE_EXE} "${VITE_BIN}" build`, { stdio: 'inherit', cwd: path.join(ROOT_DIR, 'client') });
}

// 2. Download or use cached Windows node.exe
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

async function ensureWindowsNode() {
  if (fs.existsSync(WIN_NODE_CACHE) && fs.statSync(WIN_NODE_CACHE).size > 30000000) {
    console.log('⚡ 2/6 استخدام محرك Node.js Windows المحمول من الكاش المحلي...');
    return;
  }

  console.log('⬇️ 2/6 جاري تنزيل محرك Node.js المحمول الرسمي لنظام Windows (64-bit)...');
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(WIN_NODE_CACHE);
    https.get(WIN_NODE_URL, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlinkSync(WIN_NODE_CACHE);
      reject(err);
    });
  });
  console.log('✅ اكتمل تنزيل محرك Windows node.exe بنجاح');
}

// Obfuscate helper - إعدادات آمنة لا تسبب crash على Windows
function obfuscateCode(code, filename) {
  try {
    const result = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: false, // ✅ معطل - كان يسبب crash
      deadCodeInjection: false,
      numbersToExpressions: false, // ✅ معطل للاستقرار
      simplify: true,
      stringArray: true,
      stringArrayCallsTransform: false, // ✅ معطل - يسبب مشاكل
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 2,
      stringArrayWrappersType: 'variable',
      stringArrayThreshold: 0.75,
      splitStrings: false, // ✅ معطل - كان chunk size صغير جداً
      renameGlobals: false,
      renameProperties: false,
      identifierNamesGenerator: 'hexadecimal',
      identifiersPrefix: 'zt_',
      transformObjectKeys: false, // ✅ معطل للاستقرار
      unicodeEscapeSequence: false,
      seed: 0
    });
    return result.getObfuscatedCode();
  } catch (err) {
    console.warn(`⚠️ تحذير عند تشفير ${filename}:`, err.message);
    return code;
  }
}

// Recursive copy with obfuscation for JS
function copyAndObfuscateDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    // Skip macOS resource forks and metadata files
    if (entry.name.startsWith('._') || entry.name === '.DS_Store') continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue; // Handled separately
      copyAndObfuscateDir(srcPath, destPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.js')) {
        const raw = fs.readFileSync(srcPath, 'utf8');
        const obfuscated = obfuscateCode(raw, entry.name);
        fs.writeFileSync(destPath, obfuscated, 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}


async function main() {
  await ensureWindowsNode();

  // 3. Prepare output directories
  console.log('📁 3/6 إنشاء وتجهيز بنية مجلد التوزيع...');
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(OUTPUT_DIR, 'runtime'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'server'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'client'), { recursive: true });

  // Copy node.exe
  fs.copyFileSync(WIN_NODE_CACHE, path.join(OUTPUT_DIR, 'runtime', 'node.exe'));

  // Copy client dist
  console.log('🎨 4/6 نسخ الواجهة الأمامية المبنية...');
  fs.cpSync(path.join(ROOT_DIR, 'client', 'dist'), path.join(OUTPUT_DIR, 'client', 'dist'), { recursive: true });

  // 4. Obfuscate and copy server
  console.log('🔒 5/6 تشفير وبعثرة كود السيرفر بالكامل (Obfuscation)...');
  copyAndObfuscateDir(path.join(ROOT_DIR, 'server'), path.join(OUTPUT_DIR, 'server'));

  // Copy server package.json & template market.db
  fs.copyFileSync(path.join(ROOT_DIR, 'server', 'package.json'), path.join(OUTPUT_DIR, 'server', 'package.json'));
  if (fs.existsSync(path.join(ROOT_DIR, 'server', 'market.db'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'server', 'market.db'), path.join(OUTPUT_DIR, 'server', 'market.db'));
  }

  // Copy server node_modules
  console.log('📚 نسخ مكتبات السيرفر (node_modules مع win32-x64 SQLite addon)...');
  fs.cpSync(path.join(ROOT_DIR, 'server', 'node_modules'), path.join(OUTPUT_DIR, 'server', 'node_modules'), { recursive: true });

  // 5. Generate Windows Launchers
  console.log('⚙️ 6/6 إنشاء ملفات التشغيل الآلي لويندوز...');

  // تشغيل نظام الكاشير.bat
  const startBat = `@echo off
chcp 65001 >nul
title ZoTech Supermarket POS Launcher
cd /d "%~dp0"

echo ========================================================
echo   ZoTech Supermarket POS Engine — تشغيل النظام
echo ========================================================
echo   جاري التحقق من حالة الخادم وبدء التشغيل...

:: Check if server is already running on port 5050
netstat -ano | findstr ":5050" >nul
if %errorlevel% equ 0 (
  echo   الخادم يعمل بالفعل! جاري فتح الواجهة...
  timeout /t 1 >nul
  start http://localhost:5050
  exit /b 0
)

:: Set environment to production and enforce activation
set "NODE_ENV=production"
set "ENFORCE_ACTIVATION=true"
set "PORT=5050"

:: Start node in background silently
start "ZoTech POS Server" /min "%~dp0runtime\\node.exe" "%~dp0server\\index.js"

:: Wait for server to initialize
echo   جاري تهيئة قاعدة البيانات والترخيص الآمن...
timeout /t 2 /nobreak >nul

:: Launch default browser
start http://localhost:5050

echo   تم تشغيل النظام بنجاح!
echo   يمكنك إغلاق هذه الشاشة أو تركها مصغرة.
timeout /t 3 >nul
exit /b 0
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'تشغيل نظام الكاشير.bat'), startBat, 'utf8');

  // إيقاف النظام.bat
  const stopBat = `@echo off
chcp 65001 >nul
title ZoTech POS Stopper
echo ========================================================
echo   إيقاف نظام ZoTech POS
echo ========================================================
taskkill /F /IM node.exe >nul 2>&1
echo   تم إيقاف تشغيل الخادم بنجاح.
timeout /t 2 >nul
exit /b 0
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'إيقاف النظام.bat'), stopBat, 'utf8');

  // تثبيت المكتبات من جديد.bat
  const reinstallBat = `@echo off
chcp 65001 >nul
title ZoTech POS - إعادة تثبيت المكتبات
cd /d "%~dp0"

echo ========================================================
echo   ZoTech POS - إعادة تثبيت المكتبات من الصفر
echo ========================================================
echo.
echo جاري حذف المكتبات القديمة...
echo.

:: حذف node_modules القديمة
if exist "server\\node_modules\\" (
    echo - حذف node_modules الخاصة بالخادم...
    rd /s /q "server\\node_modules" 2>nul
)

:: حذف package-lock القديمة
if exist "server\\package-lock.json" (
    echo - حذف package-lock.json الخاصة بالخادم...
    del /f /q "server\\package-lock.json" 2>nul
)

echo.
echo ========================================================
echo تم حذف المكتبات القديمة بنجاح!
echo ========================================================
echo.
echo الآن جاري تثبيت المكتبات الجديدة...
echo هذه العملية قد تستغرق عدة دقائق...
echo.

:: تثبيت مكتبات الخادم
echo تثبيت مكتبات الخادم...
cd server
"%~dp0runtime\\node.exe" "%~dp0runtime\\node_modules\\npm\\bin\\npm-cli.js" install
if errorlevel 1 (
    echo.
    echo ❌ فشل تثبيت مكتبات الخادم!
    echo الرجاء التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================================
echo   ✅ تم تثبيت جميع المكتبات بنجاح!
echo ========================================================
echo.
echo يمكنك الآن تشغيل النظام عبر ملف "تشغيل نظام الكاشير.bat"
echo.
pause
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'تثبيت المكتبات من جديد.bat'), reinstallBat, 'utf8');

  // إنشاء اختصار على سطح المكتب.vbs
  const shortcutVbs = `Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strCurrentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\\ZoTech POS.lnk")
oShellLink.TargetPath = strCurrentDir & "\\تشغيل نظام الكاشير.bat"
oShellLink.WorkingDirectory = strCurrentDir
oShellLink.WindowStyle = 7 ' Minimized
oShellLink.Description = "نظام كاشير وإدارة السوبر ماركت — ZoTech POS"
oShellLink.IconLocation = "shell32.dll, 43"
oShellLink.Save

MsgBox "تم إنشاء أيقونة واختصار تشغيل النظام على سطح المكتب بنجاح!", 64, "ZoTech POS"
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'إنشاء اختصار على سطح المكتب.vbs'), shortcutVbs, 'utf8');

  // تعليمات التشغيل لأول مرة.txt
  const readmeTxt = `========================================================================
     نظام كاشير وإدارة السوبر ماركت المتكامل — ZoTech POS
========================================================================

أهلاً بك! هذا النظام مصمم ليعمل بشكل محمول ومباشر بنقرة زر واحدة دون الحاجة لتثبيت أي برامج مسبقة.

📌 خطوات التشغيل:
1. لتشغيل البرنامج: اضغط مرتين على ملف "تشغيل نظام الكاشير.bat".
2. سيفتح البرنامج تلقائياً في متصفحك على: http://localhost:5050
3. لإنشاء اختصار مباشر على سطح المكتب: اضغط على "إنشاء اختصار على سطح المكتب.vbs".
4. لإغلاق البرنامج في أي وقت: اضغط على "إيقاف النظام.bat".

🔑 التفعيل لأول مرة:
- عند تشغيل البرنامج أول مرة على أي جهاز جديد، ستظهر شاشة التفعيل وبها "كود الجهاز (Machine ID)".
- انسخ كود الجهاز وأرسله للدعم الفني لشركة ZoTech على واتساب: 01275984405.
- ستستلم مفتاح التفعيل الدائم مدى الحياة الخاص بجهازك، ادخله واضغط "تفعيل النظام".

🔒 أمان البيانات:
- يتم حفظ قاعدة البيانات وكافة المبيعات والديون تلقائياً في مسار النظام المحمي:
  C:\\ProgramData\\ZoTechPOS\\market.db
  حتى لو قمت بنقل هذا المجلد أو حذفه بالخطأ، بياناتك تظل محفوظة وآمنة تماماً.

------------------------------------------------------------------------
تطوير وإشراف: شركة ZoTech للحلول البرمجية
واتساب وهاتف: 01275984405
========================================================================
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'تعليمات التشغيل لأول مرة.txt'), readmeTxt, 'utf8');

  console.log('\n=============================================================');
  console.log('  🎉 تم إنهاء تجهيز حزمة الويندوز بنجاح 100%!');
  console.log(`  📂 مسار المجلد الجاهز للتسليم:`);
  console.log(`  ${OUTPUT_DIR}`);
  console.log('=============================================================\n');
}

main().catch(err => {
  console.error('❌ خطأ أثناء البناء:', err);
  process.exit(1);
});
