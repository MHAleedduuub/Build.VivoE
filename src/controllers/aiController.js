const geminiFlash = require('../models/geminiFlash');

class AIController {
    // إنشاء موقع بالذكاء الاصطناعي
    async generateWebsite(req, res) {
        try {
            const { description, businessType, industry, style } = req.body;

            if (!description) {
                return res.status(400).json({
                    success: false,
                    message: 'الوصف مطلوب'
                });
            }

            // استخراج المعلومات من الوصف
            const businessInfo = await geminiFlash.extractBusinessInfo(description);

            // إنشاء الموقع
            const website = await geminiFlash.generateWebsite({
                businessType: businessType || businessInfo.business_type || 'شركة',
                industry: industry || businessInfo.services?.[0] || 'أعمال',
                features: ['موقع رئيسي', 'اتصال', 'خدمات'],
                style: style || 'حديث ومتجاوب',
                tone: businessInfo.communication_tone || 'احترافي',
                language: 'العربية'
            });

            res.json({
                success: true,
                message: 'تم إنشاء الموقع بنجاح',
                data: {
                    website,
                    businessInfo,
                    estimatedTokens: geminiFlash.estimateTokens(JSON.stringify(website))
                }
            });

        } catch (error) {
            console.error('❌ خطأ:', error);
            res.status(500).json({
                success: false,
                message: 'حدث خطأ في إنشاء الموقع',
                error: error.message
            });
        }
    }

    // توليد محتوى
    async generateContent(req, res) {
        try {
            const { topic, length, tone } = req.body;

            const content = await geminiFlash.generateContent(topic, {
                length: length || 'medium',
                tone: tone || 'professional'
            });

            res.json({
                success: true,
                data: content
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'حدث خطأ في توليد المحتوى'
            });
        }
    }

    // تحسين SEO
    async optimizeSEO(req, res) {
        try {
            const { content, keywords } = req.body;

            const seoAnalysis = await geminiFlash.optimizeSEO(content, keywords || []);

            res.json({
                success: true,
                data: seoAnalysis
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'حدث خطأ في تحسين SEO'
            });
        }
    }

    // إنشاء كود
    async generateCode(req, res) {
        try {
            const { requirement, language } = req.body;

            const code = await geminiFlash.generateCode(requirement, language || 'javascript');

            res.json({
                success: true,
                data: code
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'حدث خطأ في توليد الكود'
            });
        }
    }

    // تلخيص محتوى
    async summarize(req, res) {
        try {
            const { content, maxLength } = req.body;

            const summary = await geminiFlash.summarizeContent(content, maxLength || 300);

            res.json({
                success: true,
                data: { summary }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'حدث خطأ في التلخيص'
            });
        }
    }
}

module.exports = new AIController();
