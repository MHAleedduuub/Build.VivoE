const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// جميع الطلبات تتطلب تسجيل دخول
router.use(auth.isAuthenticated);

// إنشاء موقع
router.post('/generate-website', aiController.generateWebsite);

// توليد محتوى
router.post('/generate-content', aiController.generateContent);

// تحسين SEO
router.post('/optimize-seo', aiController.optimizeSEO);

// توليد كود
router.post('/generate-code', aiController.generateCode);

// تلخيص
router.post('/summarize', aiController.summarize);

// التحقق من حالة الـ API
router.get('/status', async (req, res) => {
    try {
        const geminiFlash = require('../models/geminiFlash');
        const isValid = await geminiFlash.validateAPIKey();
        
        res.json({
            success: isValid,
            message: isValid ? '✅ Gemini Flash يعمل بشكل صحيح' : '❌ مشكلة في الاتصال'
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
