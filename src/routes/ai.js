const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// جميع الروابط تتطلب تسجيل دخول
router.use(auth.isAuthenticated);

// إنشاء موقع بالذكاء الاصطناعي
router.post('/generate-website', aiController.generateWebsite);

// توليد محتوى
router.post('/generate-content', aiController.generateContent);

// تحسين المحتوى
router.post('/optimize-content', aiController.optimizeContent);

// اقتراح تحسينات SEO
router.post('/suggest-seo', aiController.suggestSEO);

// تحليل الصور
router.post('/analyze-image', upload.single('image'), aiController.analyzeImage);

// توليد أكواد
router.post('/generate-code', aiController.generateCode);

module.exports = router;
