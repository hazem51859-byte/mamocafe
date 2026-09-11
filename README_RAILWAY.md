# نشر المشروع على Railway

## الخطوات:

### 1. تثبيت Railway CLI (اختياري)
```bash
npm install -g @railway/cli
```

### 2. تسجيل الدخول (إذا استخدمت CLI)
```bash
railway login
```

### 3. النشر عبر GitHub (الطريقة الموصى بها)

#### أ. إنشاء مستودع Git
```bash
git init
git add .
git commit -m "Initial commit - ZoTech Market POS System"
```

#### ب. رفع المشروع على GitHub
1. أنشئ مستودع جديد على GitHub
2. ارفع المشروع:
```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

#### ج. ربط المشروع بـ Railway
1. اذهب إلى [Railway.app](https://railway.app)
2. سجل دخول أو أنشئ حساب جديد
3. اضغط "New Project"
4. اختر "Deploy from GitHub repo"
5. اختر المستودع الذي أنشأته
6. Railway سيكتشف المشروع تلقائياً وينشره!

### 4. إعدادات إضافية (في Railway Dashboard)

بعد النشر، ستحتاج لإضافة متغيرات البيئة (Environment Variables):

- `PORT`: سيتم إعداده تلقائياً من Railway
- `NODE_ENV`: `production`
- أي متغيرات أخرى يحتاجها المشروع (JWT_SECRET, إلخ)

### 5. النشر المباشر عبر CLI (بديل)
```bash
railway init
railway up
```

## ملاحظات مهمة:

✅ **قاعدة البيانات**: المشروع يستخدم SQLite وسيتم إنشاء الملف تلقائياً
⚠️ **تنبيه**: بيانات SQLite ستكون مؤقتة على Railway (تُفقد عند إعادة النشر)
💡 **للإنتاج الفعلي**: يُنصح باستخدام PostgreSQL أو MySQL من Railway

### لاستخدام PostgreSQL على Railway:
1. في Railway Dashboard، اضغط "+ New"
2. اختر "Database" → "PostgreSQL"
3. سيتم إنشاء متغير `DATABASE_URL` تلقائياً
4. عدّل كود الـ Backend لاستخدام PostgreSQL بدلاً من SQLite

## الوصول للتطبيق:

بعد النشر، ستحصل على رابط مثل:
```
https://your-project-name.up.railway.app
```

## استكشاف الأخطاء:

- راجع اللوجز في Railway Dashboard
- تأكد من أن `package.json` يحتوي على الـ `scripts` الصحيحة
- تحقق من أن المتغيرات البيئية مضبوطة بشكل صحيح

---

**تم إعداد المشروع للنشر! 🚀**
