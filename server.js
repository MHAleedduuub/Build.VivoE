require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// إعدادات أساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// إعداد EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// صفحة الاختبار
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>✅ الموقع يعمل</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 15px;
          max-width: 600px;
          margin: 0 auto;
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        .success { color: #4ade80; font-size: 1.5em; }
        .info { margin: 20px 0; }
        .btn {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 12px 30px;
          border-radius: 30px;
          text-decoration: none;
          margin: 10px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 الموقع يعمل بنجاح!</h1>
        <div class="success">✅ Server is running</div>
        <div class="info">
          <p><strong>الخطوة التالية:</strong></p>
          <p>1. تحقق من أن جميع الملفات موجودة</p>
          <p>2. تأكد من Environment Variables</p>
          <p>3. تحقق من Logs في Vercel</p>
        </div>
        <div>
          <a href="/health" class="btn">تحقق من الصحة</a>
          <a href="/test" class="btn">صفحة تجريبية</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// صفحة التحقق من الصحة
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    node: process.version,
    env: process.env.NODE_ENV || 'development',
    mongodb: process.env.MONGODB_URI ? '✅ موجود' : '❌ مفقود',
    gemini: process.env.GEMINI_API_KEY ? '✅ موجود' : '❌ مفقود',
    port: process.env.PORT || 3000
  });
});

// صفحة تجريبية
app.get('/test', (req, res) => {
  res.render('test', { 
    title: 'صفحة تجريبية',
    message: '🎉 تم تحميل EJS بنجاح!'
  });
});

// 404
app.use((req, res) => {
  res.status(404).send('الصفحة غير موجودة');
});

// معالج الأخطاء
app.use((err, req, res, next) => {
  console.error('خطأ:', err);
  res.status(500).send(`
    <h1>خطأ في السيرفر</h1>
    <p><strong>الرسالة:</strong> ${err.message}</p>
    <p><strong>التفاصيل:</strong> ${err.stack}</p>
    <a href="/">العودة للصفحة الرئيسية</a>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ السيرفر يعمل على port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📁 Views: ${path.join(__dirname, 'views')}`);
});

module.exports = app;
