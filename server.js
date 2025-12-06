require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
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

// الصفحة الرئيسية مع واجهة كاملة
app.get('/', async (req, res) => {
  const dbConnected = await connectDB();
  
  res.render('index', {
    title: '🚀 منشئ المواقع بالذكاء الاصطناعي',
    user: { name: 'مستخدم' },
    dbConnected,
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || 'http://localhost:3000'
  });
});

// صفحة البناء
app.get('/builder', (req, res) => {
  res.render('builder', {
    title: '🏗️ منشئ المواقع',
    user: { name: 'مستخدم' }
  });
});

// صفحة لوحة التحكم
app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: '📊 لوحة التحكم',
    user: { name: 'مستخدم' }
  });
});

// صفحة إنشاء موقع بالذكاء الاصطناعي
app.get('/ai/create', (req, res) => {
  res.render('ai-create', {
    title: '🤖 إنشاء موقع بالذكاء الاصطناعي',
    user: { name: 'مستخدم' }
  });
});

// API للتحقق من الصحة
app.get('/api/health', async (req, res) => {
  const dbConnected = await connectDB();
  
  res.json({
    status: 'running',
    db: dbConnected ? 'connected' : 'disconnected',
    gemini: process.env.GEMINI_API_KEY ? 'available' : 'unavailable',
    time: new Date().toISOString(),
    node: process.version
  });
});

// معالجة 404
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'الصفحة غير موجودة',
    user: { name: 'مستخدم' }
  });
});

// بدء السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل: http://localhost:${PORT}`);
  console.log(`📁 Views directory: ${path.join(__dirname, 'views')}`);
});
