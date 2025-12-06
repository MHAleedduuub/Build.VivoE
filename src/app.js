const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// استيراد التكوينات
require('./config/passport');
const connectDB = require('./config/database');

// استيراد الروابط
const authRoutes = require('./routes/auth');
const siteRoutes = require('./routes/sites');
const aiRoutes = require('./routes/ai');
const vercelRoutes = require('./routes/vercel');
const apiRoutes = require('./routes/api');

const app = express();

// ===== الوسائط الأساسية =====
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== الجلسات =====
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.COOKIE_EXPIRES_IN || '7'),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

// ===== المصادقة =====
app.use(passport.initialize());
app.use(passport.session());

// ===== السجلات =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== معدل الاستخدام =====
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100')
});
app.use('/api/', limiter);

// ===== الملفات الثابتة =====
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ===== محرك العرض =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== المتغيرات العامة =====
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.appUrl = process.env.APP_URL;
  res.locals.currentPath = req.path;
  next();
});

// ===== الروابط =====
app.use('/auth', authRoutes);
app.use('/sites', siteRoutes);
app.use('/ai', aiRoutes);
app.use('/vercel', vercelRoutes);
app.use('/api', apiRoutes);

// ===== الصفحة الرئيسية =====
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'منصة إنشاء المواقع بالذكاء الاصطناعي',
    user: req.user 
  });
});

// ===== لوحة التحكم =====
app.get('/dashboard', require('./middleware/auth').isAuthenticated, (req, res) => {
  res.render('dashboard/index', {
    title: 'لوحة التحكم',
    user: req.user
  });
});

// ===== بناء الموقع =====
app.get('/builder', require('./middleware/auth').isAuthenticated, (req, res) => {
  res.render('builder/index', {
    title: 'منشئ المواقع',
    user: req.user
  });
});

// ===== صفحة 404 =====
app.use((req, res) => {
  res.status(404).render('error/404', {
    title: 'الصفحة غير موجودة',
    user: req.user
  });
});

// ===== معالج الأخطاء =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'حدث خطأ في السيرفر';
  
  res.status(statusCode).render('error/500', {
    title: 'خطأ في السيرفر',
    message,
    user: req.user,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
