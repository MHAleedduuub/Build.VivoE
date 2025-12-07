require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// ===== Middleware =====
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use('/api/', limiter);

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Site = require('./models/Site');
const Template = require('./models/Template');

// ===== Routes =====

// Home page
app.get('/', (req, res) => {
    res.render('index', {
        title: '🚀 منشئ المواقع بالذكاء الاصطناعي',
        user: req.session.user,
        features: [
            { icon: '🤖', title: 'الذكاء الاصطناعي', desc: 'إنشاء مواقع كاملة باستخدام Gemini AI' },
            { icon: '🎨', title: 'السحب والإفلات', desc: 'صمم موقعك بسهولة بدون كتابة كود' },
            { icon: '🚀', title: 'النشر الفوري', desc: 'انشر موقعك على Vercel بنقرة واحدة' },
            { icon: '📱', title: 'تصميم متجاوب', desc: 'يعمل على جميع الأجهزة والهواتف' }
        ]
    });
});

// Dashboard
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const sites = await Site.find({ user: req.session.user.id });
        const stats = {
            totalSites: sites.length,
            publishedSites: sites.filter(s => s.status === 'published').length,
            totalViews: sites.reduce((sum, site) => sum + (site.views || 0), 0)
        };

        res.render('dashboard', {
            title: '📊 لوحة التحكم',
            user: req.session.user,
            sites: sites.slice(0, 5),
            stats: stats
        });
    } catch (error) {
        res.render('dashboard', {
            title: '📊 لوحة التحكم',
            user: req.session.user,
            sites: [],
            stats: { totalSites: 0, publishedSites: 0, totalViews: 0 }
        });
    }
});

// Builder
app.get('/builder', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.render('builder', {
        title: '🎨 منشئ المواقع',
        user: req.session.user,
        projectId: req.query.project || 'new'
    });
});

// AI Generator
app.get('/ai', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.render('ai', {
        title: '🤖 إنشاء بالذكاء الاصطناعي',
        user: req.session.user
    });
});

// Templates
app.get('/templates', async (req, res) => {
    try {
        const templates = await Template.find({ isPublic: true });
        res.render('templates', {
            title: '📁 القوالب الجاهزة',
            user: req.session.user,
            templates: templates
        });
    } catch (error) {
        res.render('templates', {
            title: '📁 القوالب الجاهزة',
            user: req.session.user,
            templates: []
        });
    }
});

// Login
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: '🔐 تسجيل الدخول', user: null });
});

// Register
app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', { title: '📝 إنشاء حساب', user: null });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ===== API Routes =====

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        services: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            gemini: process.env.GEMINI_API_KEY ? 'available' : 'unavailable',
            vercel: process.env.VERCEL_TOKEN ? 'configured' : 'not-configured'
        }
    });
});

// Auth API
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Demo user (in production, check database)
        if (email === 'demo@example.com' && password === 'demo123') {
            req.session.user = {
                id: 'demo-user-123',
                name: 'مستخدم تجريبي',
                email: 'demo@example.com',
                role: 'user'
            };
            
            return res.json({
                success: true,
                message: 'تم تسجيل الدخول بنجاح',
                user: req.session.user
            });
        }
        
        res.status(401).json({
            success: false,
            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في تسجيل الدخول'
        });
    }
});

// Site API
app.post('/api/sites/save', async (req, res) => {
    try {
        const { name, content, settings } = req.body;
        
        const site = new Site({
            name: name,
            content: content,
            settings: settings,
            user: req.session.user?.id || 'demo-user',
            status: 'draft',
            slug: name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
        });
        
        await site.save();
        
        res.json({
            success: true,
            message: 'تم حفظ الموقع بنجاح',
            siteId: site._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في حفظ الموقع'
        });
    }
});

// AI Generation API
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { prompt, type, style } = req.body;
        
        // Initialize Gemini AI
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const aiPrompt = `
        أنشئ موقع ويب ${type || 'تجاري'} بنمط ${style || 'حديث'} بناءً على الوصف التالي:
        
        ${prompt}
        
        قدم النتيجة كـ JSON بهذا التنسيق:
        {
            "html": "كود HTML كامل مع Tailwind CSS",
            "css": "كود CSS إضافي إذا لزم",
            "js": "كود JavaScript للتفاعلية",
            "title": "عنوان الموقع",
            "description": "وصف الموقع"
        }
        `;
        
        const result = await model.generateContent(aiPrompt);
        const response = await result.response;
        const text = response.text();
        
        // Try to parse JSON from response
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const websiteData = jsonMatch ? JSON.parse(jsonMatch[0]) : { html: text };
            
            res.json({
                success: true,
                data: websiteData
            });
        } catch (parseError) {
            res.json({
                success: true,
                data: {
                    html: text,
                    css: '',
                    js: '',
                    title: 'موقع تم إنشاؤه بالذكاء الاصطناعي',
                    description: prompt
                }
            });
        }
    } catch (error) {
        console.error('AI Generation error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في إنشاء الموقع'
        });
    }
});

// Vercel Deployment API
app.post('/api/vercel/deploy', async (req, res) => {
    try {
        const { siteId, projectName } = req.body;
        
        // In production, integrate with Vercel API
        // This is a demo response
        res.json({
            success: true,
            message: 'جاري نشر الموقع على Vercel',
            deployment: {
                id: 'dpl_' + Math.random().toString(36).substr(2, 9),
                url: `https://${projectName || 'my-website'}.vercel.app`,
                status: 'QUEUED'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في النشر'
        });
    }
});

// Preview site
app.get('/preview/:siteId', async (req, res) => {
    try {
        const site = await Site.findById(req.params.siteId);
        if (!site) {
            return res.status(404).send('الموقع غير موجود');
        }
        
        res.render('preview', {
            title: site.name,
            site: site,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).send('حدث خطأ في تحميل المعاينة');
    }
});

// 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: '😕 الصفحة غير موجودة',
        user: req.session.user
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).render('error', {
        title: '🚨 حدث خطأ',
        message: err.message,
        user: req.session.user
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
    console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? 'Available' : 'Not configured'}`);
});

module.exports = app;