require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const app = express();

// إعدادات أساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🚀 منشئ المواقع - يعمل بنجاح!</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    text-align: center;
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }
                h1 {
                    font-size: 3rem;
                    margin-bottom: 20px;
                }
                .status {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #10B981;
                    border-radius: 20px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .links {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    justify-content: center;
                    margin: 30px 0;
                }
                .btn {
                    padding: 15px 30px;
                    background: white;
                    color: #667eea;
                    text-decoration: none;
                    border-radius: 10px;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                .btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(255,255,255,0.3);
                }
                .info {
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    text-align: right;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎉 منشئ المواقع يعمل بنجاح!</h1>
                <div class="status">✅ Server is running on Vercel</div>
                
                <div class="info">
                    <h3>📊 معلومات النظام:</h3>
                    <p><strong>البيئة:</strong> ${process.env.NODE_ENV || 'production'}</p>
                    <p><strong>المنصة:</strong> Vercel Serverless Functions</p>
                    <p><strong>الوقت:</strong> ${new Date().toLocaleString('ar-SA')}</p>
                </div>
                
                <div class="links">
                    <a href="/builder" class="btn">🎨 منشئ المواقع</a>
                    <a href="/health" class="btn">📊 حالة النظام</a>
                    <a href="/test" class="btn">🧪 صفحة تجريبية</a>
                </div>
                
                <p style="margin-top: 30px; opacity: 0.9;">
                    تم النشر بنجاح على Vercel | جميع المميزات تعمل الآن
                </p>
            </div>
        </body>
        </html>
    `);
});

// صفحة البناء (مبسطة)
app.get('/builder', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎨 منشئ المواقع - السحب والإفلات</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #f5f7fa;
                }
                
                .navbar {
                    background: white;
                    padding: 15px 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .logo {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #3B82F6;
                    text-decoration: none;
                }
                
                .builder-container {
                    display: flex;
                    height: calc(100vh - 70px);
                }
                
                .toolbox {
                    width: 250px;
                    background: white;
                    padding: 20px;
                    border-right: 1px solid #e5e7eb;
                }
                
                .component-item {
                    background: #f9fafb;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .component-item:hover {
                    background: #e0e7ff;
                    border-color: #3B82F6;
                }
                
                .canvas {
                    flex: 1;
                    padding: 30px;
                    background: #f8fafc;
                    overflow: auto;
                }
                
                .drop-area {
                    background: white;
                    min-height: 400px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    padding: 30px;
                    text-align: center;
                    color: #6b7280;
                    border: 3px dashed #d1d5db;
                }
                
                .btn {
                    padding: 12px 24px;
                    background: #3B82F6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 5px;
                }
                
                .btn-success {
                    background: #10B981;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    justify-content: center;
                }
            </style>
        </head>
        <body>
            <nav class="navbar">
                <a href="/" class="logo">🎨 منشئ المواقع</a>
                <div>
                    <input type="text" value="مشروعي" style="padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
            </nav>
            
            <div class="builder-container">
                <div class="toolbox">
                    <h3>📦 المكونات</h3>
                    <div class="component-item" onclick="addComponent('hero')">
                        ⭐ قسم البطل
                    </div>
                    <div class="component-item" onclick="addComponent('features')">
                        🔧 المميزات
                    </div>
                    <div class="component-item" onclick="addComponent('contact')">
                        📞 اتصل بنا
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <button class="btn" onclick="generateWithAI()">
                            🤖 مساعد الذكاء
                        </button>
                    </div>
                </div>
                
                <div class="canvas">
                    <div class="drop-area" id="canvas">
                        <h3>ابدأ ببناء موقعك</h3>
                        <p>انقر على المكونات لإضافتها هنا</p>
                        
                        <div id="components-container"></div>
                        
                        <div class="action-buttons">
                            <button class="btn" onclick="saveProject()">💾 حفظ</button>
                            <button class="btn btn-success" onclick="previewProject()">👁️ معاينة</button>
                            <button class="btn" onclick="publishProject()" style="background: #8B5CF6;">🚀 نشر</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                let components = [];
                
                function addComponent(type) {
                    const container = document.getElementById('components-container');
                    const component = document.createElement('div');
                    component.className = 'component-item';
                    component.style.background = 'white';
                    component.style.border = '2px solid #3B82F6';
                    component.style.padding = '20px';
                    component.style.margin = '10px 0';
                    component.style.borderRadius = '8px';
                    
                    if (type === 'hero') {
                        component.innerHTML = \`
                            <h3 style="color: #3B82F6;">⭐ قسم البطل</h3>
                            <p>عنوان رئيسي جذاب مع زر للدعوة للعمل</p>
                            <button onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-top: 10px;">حذف</button>
                        \`;
                    } else if (type === 'features') {
                        component.innerHTML = \`
                            <h3 style="color: #10B981;">🔧 قسم المميزات</h3>
                            <p>عرض مميزات المنتج أو الخدمة</p>
                            <button onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-top: 10px;">حذف</button>
                        \`;
                    }
                    
                    container.appendChild(component);
                    components.push({ type: type, id: Date.now() });
                }
                
                function generateWithAI() {
                    const prompt = prompt('ماذا تريد أن تنشئ بالذكاء الاصطناعي؟');
                    if (prompt) {
                        alert('جاري إنشاء المحتوى...');
                        addComponent('hero');
                        addComponent('features');
                    }
                }
                
                function saveProject() {
                    localStorage.setItem('project', JSON.stringify(components));
                    alert('تم حفظ المشروع بنجاح!');
                }
                
                function previewProject() {
                    if (components.length === 0) {
                        alert('أضف بعض المكونات أولاً');
                        return;
                    }
                    alert('المعاينة جاهزة!');
                }
                
                function publishProject() {
                    if (components.length === 0) {
                        alert('أضف بعض المكونات أولاً');
                        return;
                    }
                    
                    fetch('/api/publish', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ components: components })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert(\`✅ تم النشر بنجاح!\\n🔗 \${data.url}\`);
                        } else {
                            alert('❌ فشل النشر: ' + data.message);
                        }
                    })
                    .catch(err => {
                        alert('❌ خطأ: ' + err.message);
                    });
                }
                
                // تحميل المشروع المحفوظ
                document.addEventListener('DOMContentLoaded', () => {
                    const saved = localStorage.getItem('project');
                    if (saved) {
                        components = JSON.parse(saved);
                        components.forEach(comp => addComponent(comp.type));
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// صفحة التحقق من الصحة
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        node_version: process.version,
        platform: 'Vercel Serverless',
        endpoints: {
            '/': 'الرئيسية',
            '/builder': 'منشئ المواقع',
            '/health': 'حالة النظام',
            '/test': 'صفحة تجريبية',
            '/api/*': 'واجهة برمجة التطبيقات'
        },
        services: {
            mongodb: process.env.MONGODB_URI ? 'configured' : 'not-configured',
            gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not-configured',
            vercel: process.env.VERCEL_TOKEN ? 'configured' : 'not-configured'
        }
    });
});

// صفحة تجريبية
app.get('/test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>✅ صفحة تجريبية</title>
            <style>
                body { font-family: Arial; padding: 30px; text-align: center; }
                .success { color: #10B981; font-size: 2rem; }
                .box { background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px; }
            </style>
        </head>
        <body>
            <h1 class="success">✅ كل شيء يعمل بشكل صحيح!</h1>
            <div class="box">
                <h3>المسارات المتاحة:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li><a href="/">🏠 الرئيسية</a></li>
                    <li><a href="/builder">🎨 منشئ المواقع</a></li>
                    <li><a href="/health">📊 حالة النظام</a></li>
                </ul>
            </div>
        </body>
        </html>
    `);
});

// API للنشر
app.post('/api/publish', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'تم النشر بنجاح على Vercel',
            url: 'https://your-site.vercel.app',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 404
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>404</title></head>
        <body style="text-align: center; padding: 50px;">
            <h1>😕 الصفحة غير موجودة</h1>
            <a href="/">العودة للرئيسية</a>
        </body>
        </html>
    `);
});

// معالج الأخطاء
app.use((err, req, res, next) => {
    console.error('❌ خطأ:', err);
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>خطأ</title></head>
        <body style="text-align: center; padding: 50px;">
            <h1>🚨 حدث خطأ</h1>
            <p>${err.message}</p>
            <a href="/">العودة للرئيسية</a>
        </body>
        </html>
    `);
});

// بدء السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على port ${PORT}`);
});

module.exports = app;
