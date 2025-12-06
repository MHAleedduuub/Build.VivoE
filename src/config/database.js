const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ قاعدة البيانات متصلة: ${conn.connection.host}`);
    
    // معالجة أخطاء الاتصال
    mongoose.connection.on('error', (err) => {
      console.error(`❌ خطأ في قاعدة البيانات: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  قاعدة البيانات غير متصلة');
    });

    // إعادة الاتصال عند فقدانه
    mongoose.connection.on('reconnected', () => {
      console.log('🔁 قاعدة البيانات متصلة مجدداً');
    });

  } catch (error) {
    console.error(`❌ خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
    process.exit(1);
  }
};

// معالجة إغلاق التطبيق
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 قاعدة البيانات مغلقة');
  process.exit(0);
});

module.exports = connectDB;
