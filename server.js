require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
connectDB();

// بدء السيرفر
const server = app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
  console.log(`📝 بيئة التشغيل: ${process.env.NODE_ENV}`);
});

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (err) => {
  console.log('❌ خطأ غير متوقع:', err.message);
  server.close(() => process.exit(1));
});

module.exports = server;
