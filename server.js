require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// إعدادات أساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// إعداد EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// الاتصال بقاعدة البيانات
async function connectDB() {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ تم الاتصال بـ MongoDB');
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ خطأ في MongoDB:', error.message);
        return false;
    }
}

// ===== ربط ملفات HTML مع تحويلها إلى EJS =====

// دالة لقراءة ملف HTML وتحويله إلى EJS
function convertHTMLtoEJS(htmlFilePath) {
    try {
        if (fs.existsSync(htmlFilePath)) {
            let content = fs.readFileSync(htmlFilePath, 'utf8');
            
            // تحويل مسارات CSS وJS لتصبح نسبية
            content = content.replace(/href="\/css\//g, 'href="/css/');
            content = content.replace(/src="\/js\//g, 'src="/js/');
            content = content.replace(/src="\/images\//g, 'src="/images/');
            
            // إضافة متغيرات ديناميكية
            content = content.replace('<body>', `<body data-node-env="${process.env.NODE_ENV}">`);
            
            return content;
        }
        return '<h1>الصفحة غير موجودة</h1>';
    } catch (error) {
        console.error('❌ خطأ في قراءة الملف:', error.message);
        return '<h1>خطأ في تحميل الصفحة</h1>';
    }
}

// ===== الصفحات الرئيسية =====

// الرئيسية
app.get('/', async (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/index.html'));
    res.send(htmlContent);
});

// لوحة التحكم
app.get('/dashboard', async (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/dashboard.html'));
    res.send(htmlContent);
});

// منشئ المواقع
app.get('/builder', async (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/builder.html'));
    res.send(htmlContent);
});

// الذكاء الاصطناعي
app.get('/ai/create', async (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/ai-create.html'));
    res.send(htmlContent);
});

// تسجيل الدخول
app.get('/login', async (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/login.html'));
    res.send(htmlContent);
});

// إنشاء حساب
app.get('/register', async (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/register.html'));
    res.send(htmlContent);
});

// القوالب
app.get('/templates', async (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/templates.html'));
    res.send(htmlContent);
});

// ===== API =====

// صفحة التحقق من الصحة
app.get('/api/health', async (req, res) => {
    const dbConnected = await connectDB();
    
    res.json({
        status: 'running',
        server: 'Node.js + Express',
        database: dbConnected ? 'connected' : 'disconnected',
        gemini: process.env.GEMINI_API_KEY ? 'available' : 'unavailable',
        vercel: process.env.VERCEL_TOKEN ? 'configured' : 'not-configured',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API للذكاء الاصطناعي (مثال)
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // هنا ستدمج Gemini AI
        res.json({
            success: true,
            message: 'سيتم دمج Gemini AI هنا',
            prompt: prompt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// API للنشر على Vercel (مثال)
app.post('/api/vercel/deploy', async (req, res) => {
    try {
        const { siteName, content } = req.body;
        
        // هنا ستدمج Vercel API
        res.json({
            success: true,
            message: 'سيتم دمج Vercel API هنا',
            siteName: siteName,
            url: `https://${siteName}.vercel.app`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== التعامل مع ملفات ثابتة =====

// CSS
app.get('/css/:file', (req, res) => {
    const filePath = path.join(__dirname, 'public/css', req.params.file);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('ملف CSS غير موجود');
    }
});

// JS
app.get('/js/:file', (req, res) => {
    const filePath = path.join(__dirname, 'public/js', req.params.file);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('ملف JS غير موجود');
    }
});

// Images
app.get('/images/:file', (req, res) => {
    const filePath = path.join(__dirname, 'public/images', req.params.file);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('الصورة غير موجودة');
    }
});

// ===== الصفحات الخاصة =====

// 404
app.get('/404', (req, res) => {
    const htmlContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/404.html'));
    res.send(htmlContent);
});

// catch all route للصفحات الأخرى
app.get('*', (req, res) => {
    const requestedPath = req.path;
    
    // تحقق إذا كان هناك ملف HTML بنفس الاسم
    const htmlFilePath = path.join(__dirname, 'public/pages', requestedPath + '.html');
    
    if (fs.existsSync(htmlFilePath)) {
        const htmlContent = convertHTMLtoEJS(htmlFilePath);
        res.send(htmlContent);
    } else {
        // إعادة توجيه إلى 404
        const notFoundContent = convertHTMLtoEJS(path.join(__dirname, 'public/pages/404.html'));
        res.status(404).send(notFoundContent);
    }
});

// معالج الأخطاء
app.use((err, req, res, next) => {
    console.error('❌ خطأ:', err);
    const errorContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>خطأ في السيرفر</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; }
                h1 { color: #dc2626; }
            </style>
        </head>
        <body>
            <h1>🚨 خطأ في السيرفر</h1>
            <p>${err.message}</p>
            <a href="/">العودة للصفحة الرئيسية</a>
        </body>
        </html>
    `;
    res.status(500).send(errorContent);
});

// ===== بدء السيرفر =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Public files: ${path.join(__dirname, 'public')}`);
    console.log(`📄 HTML Pages: ${path.join(__dirname, 'public/pages')}`);
    
    // الاتصال بقاعدة البيانات
    await connectDB();
    
    // عرض جميع المسارات المتاحة
    console.log('\n📡 المسارات المتاحة:');
    console.log('  /              - الرئيسية');
    console.log('  /dashboard     - لوحة التحكم');
    console.log('  /builder       - منشئ المواقع');
    console.log('  /ai/create     - الذكاء الاصطناعي');
    console.log('  /login         - تسجيل الدخول');
    console.log('  /register      - إنشاء حساب');
    console.log('  /templates     - القوالب');
    console.log('  /api/health    - التحقق من الصحة');
    console.log('  /css/*         - ملفات CSS');
    console.log('  /js/*          - ملفات JavaScript');
    console.log('  /images/*      - الصور');
});

module.exports = app;
