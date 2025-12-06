require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// إعدادات أساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// صفحة رئيسية بسيطة
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚀 موقع إنشاء المواقع</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            h1 {
                font-size: 3em;
                margin-bottom: 20px;
            }
            .status {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .success {
                color: #4ade80;
                font-weight: bold;
            }
            .error {
                color: #f87171;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <h1>🚀 موقع إنشاء المواقع</h1>
        <div class="status" id="status">
            جاري التحقق من الاتصالات...
        </div>
        <div id="info"></div>
        <script>
            fetch('/health')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('status').innerHTML = 
                        '<span class="success">✅ السيرفر يعمل بشكل صحيح</span>';
                    document.getElementById('info').innerHTML = 
                        \`<p>المتغيرات: \${data.env}</p>
                         <p>الاتصال بقاعدة البيانات: \${data.db}</p>
                         <p>Gemini API: \${data.gemini}</p>\`;
                })
                .catch(err => {
                    document.getElementById('status').innerHTML = 
                        '<span class="error">❌ خطأ في الاتصال: ' + err.message + '</span>';
                });
        </script>
    </body>
    </html>
  `);
});

// صفحة التحقق من الصحة
app.get('/health', async (req, res) => {
  try {
    // تحقق من اتصال MongoDB
    let dbStatus = '❌ غير متصل';
    if (process.env.MONGODB_URI) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000
        });
        dbStatus = '✅ متصل';
      } catch (dbError) {
        dbStatus = `❌ خطأ: ${dbError.message}`;
      }
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'غير محدد',
      db: dbStatus,
      gemini: process.env.GEMINI_API_KEY ? '✅ موجود' : '❌ مفقود',
      mongodb: process.env.MONGODB_URI ? '✅ موجود' : '❌ مفقود'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// صفحة 404
app.use((req, res) => {
  res.status(404).send('الصفحة غير موجودة');
});

// معالج الأخطاء
app.use((err, req, res, next) => {
  console.error('خطأ:', err);
  res.status(500).send('حدث خطأ داخلي في السيرفر');
});

// الاتصال بقاعدة البيانات عند التشغيل
async function connectDB() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ تم الاتصال بـ MongoDB');
    } else {
      console.log('⚠️  MONGODB_URI غير موجود، جاري التشغيل بدون قاعدة بيانات');
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال بـ MongoDB:', error.message);
  }
}

// بدء السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 السيرفر يعمل على port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI ? 'موجود' : 'مفقود'}`);
  console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? 'موجود' : 'مفقود'}`);
  
  await connectDB();
});

module.exports = app;
